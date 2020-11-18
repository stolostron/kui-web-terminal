// Copyright (c) 2020 Red Hat, Inc.

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const debug = require('debug')('proxy/userUtils');
const util = require('util');
const childProcess=require('child_process');
const exec = util.promisify(childProcess.exec);
const LINUX_DISTRO = process.env['LINUX_DISTRO'];
const INSECURE_MODE = process.env['INSECURE_MODE'];
const LOGIN_TIMEOUT = 20000;
const NOBODY_GID = parseInt(process.env.NOBODY_GID || '99',10);

const loginTools = require('./securityUtils').getLoginTools();

const metricTools = require('./metricsUtils');
//mapping of cookie->uid
let nextUID=65536;

/**
 * This async function will create a new user.
 * The results will be in the user parameter
 * @param user an object to receive return data
 */
async function createUser(user) {
    user.uid = nextUID;
    nextUID++;
    user.name = 'u_'+ user.uid;
    user.home = '/home/' + user.uid;
    let adduserCmd = ''
    if ( LINUX_DISTRO !== 'rhel' ) {
      adduserCmd = 'umask 0077 && rbash -c \'adduser --uid ' + user.uid + ' --home ' + user.home + ' --gecos "" --disabled-login --disabled-password ' + user.name + '\''
      //adduserCmd = "umask 0077 && rbash -c 'adduser -u " + user.uid + " -m  --comment \"\" -d " + user.home + " " + user.name + "'"
    }
    else {
      adduserCmd = 'umask 0077 && rbash -c \'useradd --uid ' + user.uid + ' --home-dir ' + user.home + ' --comment "" ' + user.name + '\''
    }
    adduserCmd = adduserCmd + ` && chmod a-w ${user.home}/.bashrc && chmod a-w ${user.home}/.bash_profile`
    adduserCmd = adduserCmd + ` && chown 0:0 ${user.home}/.bashrc && chown 0:0 ${user.home}/.bash_profile`

    console.log('creating user: ' + adduserCmd)
    await exec(adduserCmd, {
      stdio: [0,1,2],
      timeout: 5000
    }).then(function () {
        console.log('user created')
    })
 }

module.exports.deleteUser = async (username) => {
    let deleteUserCmd = '';
    if ( LINUX_DISTRO !== 'rhel' )
    {
      deleteUserCmd = 'rbash -c \'deluser --remove-home --quiet ' + username + '\'';
    }
    else {
      deleteUserCmd = 'rbash -c \'userdel --remove ' + username + '\'';
    }
    console.log('deleting user: ' + deleteUserCmd);
    await exec(deleteUserCmd, {
      stdio: [0,1,2],
      timeout: 5000
    });
    console.log('user deleted');
}

const setupUserEnv = (user)=>{
    const userEnv = {};
    for (const e in process.env) {
      userEnv[e] = process.env[e];
    }
    userEnv['CLOUDCTL_COLOR'] = false;
    userEnv['USER'] = user.name;
    userEnv['HOME'] = user.home;
    return userEnv;
}


const loginUser = (user, namespace, accessToken, idToken) =>{
    const loginArgs = loginTools.getLoginArgs(namespace,accessToken,idToken)
    const loginEnv = loginTools.getLoginEnvs(user.env,accessToken,idToken)
    const loginOpts = {
        cwd: loginEnv['HOME'],
        env: loginEnv,
        timeout: LOGIN_TIMEOUT,
        uid: user.uid,
        gid: NOBODY_GID
    }
    return new Promise(function(resolve, reject) {
        const loginProc = childProcess.spawn(loginTools.getLoginCMD(), loginArgs, loginOpts);
        setTimeout(()=>{
          loginProc.kill();
          reject('timeout');
        }, LOGIN_TIMEOUT);
        loginProc.stdin.end();
        let loginOutput = '';
        loginProc.stdout.on('data', function (data) {
          loginOutput += String(data);
        });
        loginProc.stderr.on('data', function (data) {
          loginOutput += String(data);
        });
        loginProc.on('error', function (err) {
          console.error(user.name + ' login failed.');
          console.error(err.toString());
        });
        loginProc.on('exit', function (code) {
          if (code === 0) {
            // Notify metrics a new session was created
            metricTools.newSession('12345');
            console.log('user ' + user.name + ' login complete in terminal ');
            return resolve();
          }
          // login failed, close the terminal
          console.error('user ' + user.name + ' login failed in terminal with exit code ' + code);

          let errMsg = '';
          const lines = loginOutput.split('\n');
          for (let i = lines.length-1; i > 0; i--) { // account for possible blank line
            errMsg = lines[i];
            if (errMsg !== '') {
               break;
            }
          }
          console.error(errMsg)
          reject(errMsg);
        });
    })
}



/**
 * This function is async, and it will return a user object {uid,env} for the cookie.
 * if the user is not created before, it will create a new one within the container.
 * @param {*} token a string of accessToken, will be used as a key for user mapping
 */
module.exports.getUser = async (token) => {

    let idToken = ''
    const accessToken = token
    let namespace = ''
    //user validation
    if(!INSECURE_MODE){
        debug('start user validation')
        try{
            idToken = await loginTools.verifyAccessToken(token)
            namespace = await loginTools.getNamespace(token)
        }catch(e){
            debug('user token validation failed')
            throw e
        }
    }


    //create new user with home folder set
    //It's possible to have one user set up two different UIDs because we didn't add locks
    try{
        const user={};
        await createUser(user);
        debug('return uid:',user.uid);
        user.env=setupUserEnv(user);
        user.created=true;
        if(!INSECURE_MODE){
            await loginUser(user,namespace,accessToken,idToken);
            if (process.env.NODE_ENV !== 'development') {
              await loginTools.postSetup(user);
            }
        }
        return user;
    }catch(e){
        debug('failed in creating users:', e);
        throw e;
    }

}
module.exports.NOBODY_GID = NOBODY_GID;
