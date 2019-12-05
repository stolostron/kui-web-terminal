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
const child_process=require('child_process');
const exec = util.promisify(child_process.exec);
const LINUX_DISTRO = process.env["LINUX_DISTRO"];
const INSECURE_MODE = process.env["INSECURE_MODE"];
const {verifyAccessToken, ICP_EXTERNAL_URL, getNamespace} = require('./securityUtils');
const NOBODY_GID = parseInt(process.env.NOBODY_GID || '99',10);
//mapping of cookie->uid
let nextUID=65536;

/**
 * This async function will create a new user.
 * The results will be in the user parameter
 * @param user an object to receive return data
 */
async function createUser(user) {
    user.uid = nextUID++;
    user.name = "u_"+ user.uid;
    user.home = "/home/" + user.uid;
    let adduserCmd = ''
    if ( LINUX_DISTRO != 'rhel' ) {
      adduserCmd = "umask 0077 && rbash -c 'adduser --uid " + user.uid + " --home " + user.home + " --gecos \"\" --disabled-login --disabled-password " + user.name + "'"
      //adduserCmd = "umask 0077 && rbash -c 'adduser -u " + user.uid + " -m  --comment \"\" -d " + user.home + " " + user.name + "'"
    }
    else {
      adduserCmd = "umask 0077 && rbash -c 'useradd --uid " + user.uid + " --home-dir " + user.home + " --comment \"\" " + user.name + "'"
    }
  
    console.log('creating user: ' + adduserCmd)
    await exec(adduserCmd, {
      stdio: [0,1,2],
      timeout: 5000
    }).then(function () {
        console.log("user created")
    })
 }

module.exports.deleteUser = async (username) => {
    let deleteUserCmd = '';
    if ( LINUX_DISTRO != 'rhel' )
    {
      deleteUserCmd = "rbash -c 'deluser --remove-home --quiet " + username + "'";
    }
    else {
      deleteUserCmd = "rbash -c 'userdel --remove " + username + "'";
    }
    console.log('deleting user: ' + deleteUserCmd);
    await exec(deleteUserCmd, {
      stdio: [0,1,2],
      timeout: 5000
    });
    console.log("user deleted");
}

const setupUserEnv = (user)=>{
    let userEnv = {};
    for (let e in process.env) userEnv[e] = process.env[e];
    //userEnv["CLOUDCTL_ACCESS_TOKEN"] = user.accessToken;
    //userEnv["CLOUDCTL_ID_TOKEN"] = user.idToken;
    userEnv["CLOUDCTL_COLOR"] = false;
    userEnv["USER"] = user.name;
    userEnv["HOME"] = user.home;
    //user.env=userEnv;
    return userEnv;
}

const loginUser = (user, namespace, accessToken, idToken) =>{
    const loginArgs = ["login", "-a", ICP_EXTERNAL_URL, "-n", namespace, "--skip-ssl-validation"];
    const loginEnv = Object.assign({}, user.env,{"CLOUDCTL_ACCESS_TOKEN":accessToken,"CLOUDCTL_ID_TOKEN":idToken})
    const loginOpts = {
        cwd: loginEnv["HOME"],
        env: loginEnv,
        timeout: 20000,
        uid: user.uid,
        gid: NOBODY_GID
    }
    return new Promise(function(resolve, reject) {
        let loginProc = child_process.spawn('/usr/local/bin/cloudctl', loginArgs, loginOpts);
        loginProc.stdin.end();
        let loginOutput = '';
        loginProc.stdout.on("data", function (data) {
          loginOutput += String(data);
        });
        loginProc.stderr.on("data", function (data) {
          loginOutput += String(data);
        });
        loginProc.on("error", function (err) {
          console.error(user.name + " login failed.");
          console.error(err.toString());
        });
        loginProc.on("exit", function (code) {
          if (code == 0) {
            console.log('user ' + user.name + ' login complete in terminal ');
            return resolve();
          }
          // login failed, close the terminal
          console.log('user ' + user.name + ' login failed in terminal with exit code ' + code);
    
          let errMsg = "";
          let lines = loginOutput.split('\n');
          for (let i = lines.length-1; i > 0; i--) { // account for possible blank line
            errMsg = lines[i];
            if (errMsg != "") break;
          }
          reject(errMsg);
        });
    })
}

const updateKubeServerConfig = user => {
  let config = {}
  try {
    config = require(`${user.env["HOME"]}/.cloudctl/cloudctl.json`)
  } catch(e) {
    console.error('failed to import cloudctl.json with error: ', e)
  }
  const kubeArgs = ["config", "set-cluster", config['cluster-name'], "--server=https://kubernetes.default.svc:443", "--insecure-skip-tls-verify=true"];
  const kubeOpts = {
      cwd: user.env["HOME"],
      env: user.env,
      timeout: 20000,
      uid: user.uid,
      gid: NOBODY_GID
  }
  return new Promise(function(resolve) {
    if (!config['cluster-name']) {
      console.log('failed to read cluster-name from config, aborting kube api server rewrite')
      return resolve()
    }

    let kubeProc = child_process.spawn('/usr/local/bin/kubectl', kubeArgs, kubeOpts)
    kubeProc.stdin.end()
    let kubeOutput = ''
    kubeProc.stdout.on("data", function (data) {
      kubeOutput += String(data);
    })
    kubeProc.stderr.on("data", function (data) {
      kubeOutput += String(data);
    })
    kubeProc.on("error", function (err) {
      console.error(user.name + " kube api server rewrite failed.")
      console.error(err.toString())
    })
    kubeProc.on("exit", function (code) {
      if (code == 0) {
        console.log('user ' + user.name + ' kube api server rewrite success ')
        return resolve()
      }

      console.log('user ' + user.name + ' kube api server rewrite failed with exit code ' + code)

      let errMsg = ""
      let lines = kubeOutput.split('\n')
      for (let i = lines.length-1; i > 0; i--) { // account for possible blank line
        errMsg = lines[i]
        if (errMsg != "") break
      }
      resolve(errMsg) // we won't fail the whole login
    })
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
            idToken = await verifyAccessToken(token)
            namespace = await getNamespace(token)
        }catch(e){
            debug('user token validation failed')
            throw e
        }
    }
    
    
    let user={};
    //create new user with home folder set
    //It's possible to have one user set up two different UIDs because we didn't add locks
    try{
        await createUser(user);
        debug('return uid:',user.uid);
        user.env=setupUserEnv(user);
        user.created=true;
        if(!INSECURE_MODE){
            await loginUser(user,namespace,accessToken,idToken);
            if (process.env.NODE_ENV !== 'development') {
              await updateKubeServerConfig(user);
            }
        }
        return user;
    }catch(e){
        debug('failed in creating users:', e);
        if(user && user.name){
          this.deleteUser(user.name);
        }
        throw e;
    }
    
}
module.exports.NOBODY_GID = NOBODY_GID;