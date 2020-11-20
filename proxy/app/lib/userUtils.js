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
const CLUSTER_VERSION_TIMEOUT = 10000;
const NOBODY_GID = parseInt(process.env.NOBODY_GID || '99',10);

const loginTools = require('./securityUtils').getLoginTools();

const metricTools = require('./metricsUtils');
//mapping of cookie->uid
let nextUID=65536;

// caching the cluster ID, will be set on first user login to the cluster
let clusterID = ''

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

// This function is used to get the clusterID of the cluster where Visual Web Terminal is deployed
// and cache it.  This is only needed to be done once the first time a user session is created after
// the Visual Web Terminal container has started.
const getClusterID = (user, accessToken, idToken) => {
  // Use the loginTools environment info as it is the same as what we need to run the oc command
  const cmdEnv = loginTools.getLoginEnvs(user.env, accessToken, idToken);
  const cmdOpts = {
    cwd: cmdEnv['HOME'],
    env: cmdEnv,
    timeout: CLUSTER_VERSION_TIMEOUT,
    uid: user.uid,
    gid: NOBODY_GID
  };
  return new Promise(function (resolve, reject) {
    // Spawn a child process that just runs the following command to retrieve the clusterID (documented in OCP documentation)
    //   oc get clusterversion -o jsonpath='{.items[].spec.clusterID}{"\n"}'
    const clusterIDProc = childProcess.spawn('/usr/local/bin/oc', ["get", "clusterversion", "-o", "jsonpath='{.items[].spec.clusterID}'"], cmdOpts);
    setTimeout(() => {
      clusterIDProc.kill();
      reject('timeout');
    }, CLUSTER_VERSION_TIMEOUT);
    clusterIDProc.stdin.end();
    let clusterVersionOutput = '';
    clusterIDProc.stdout.on('data', function (data) {
      clusterVersionOutput += String(data);
    });
    clusterIDProc.stderr.on('data', function (data) {
      clusterVersionOutput += String(data);
    });
    clusterIDProc.on('error', function (err) {
      console.error('Attempt to get clusterID failed.');
      console.error(err.toString());
    });
    clusterIDProc.on('exit', function (retCode) {
      if (retCode === 0) {
        console.log('clusterID = ' + clusterVersionOutput);
        if (clusterVersionOutput.length > 0) {
          clusterID = clusterVersionOutput;
        }
        return resolve();
      }
      // Retrieving the cluster version info failed
      console.log('Attempt to get the cluster version information failed in terminal with exit code ' + retCode);
      let errorMsg = '';
      const errLines = clusterVersionOutput.split('\n');
      for (let i = errLines.length - 1; i > 0; i--) { // account for possible blank line
        errorMsg = errLines[i];
        if (errorMsg !== '') {
          break;
        }
      }
      console.error(errorMsg);
      reject(errorMsg);
    });
  });
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
            // Check if we have the clusterID yet for where we are running
            if (clusterID.length === 0) {
              // Need to get and cache the clusterID the first time since this container started
              (async () => {
                await getClusterID(user,accessToken,idToken);
              })();
            }
            // Notify metrics a new session was created
            metricTools.newSession(clusterID);
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
