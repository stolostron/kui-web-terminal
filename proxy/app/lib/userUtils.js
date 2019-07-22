const debug = require('debug')('proxy/userUtils');
const util = require('util');
const child_process=require('child_process');
const exec = util.promisify(child_process.exec);
const LINUX_DISTRO = process.env["LINUX_DISTRO"];
const INSECURE_MODE = process.env["INSECURE_MODE"];
const {verifyAccessToken} = require('./securityUtils');
//mapping of cookie->uid
let users={};
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
      //adduserCmd = "umask 0077 && rbash -c 'adduser --uid " + user.uid + " --home " + user.home + " --gecos \"\" --disabled-login --disabled-password " + user.name + "'"
      adduserCmd = "umask 0077 && bash -c 'adduser -u " + user.uid + " -m  --comment \"\" -d " + user.home + " " + user.name + "'"
    }
    else {
      adduserCmd = "umask 0077 && bash -c 'useradd --uid " + user.uid + " --home-dir " + user.home + " --comment \"\" " + user.name + "'"
    }
  
    debug('creating user: ' + adduserCmd)
    await exec(adduserCmd, {
      stdio: [0,1,2],
      timeout: 5000
    }).then(function () {
      debug("user created")
    })
 }
const setupUserEnv = (user)=>{
    let userEnv = {};
    for (let e in process.env) userEnv[e] = process.env[e];
    userEnv["CLOUDCTL_ACCESS_TOKEN"] = user.accessToken;
    //userEnv["CLOUDCTL_ID_TOKEN"] = user.idToken;
    userEnv["CLOUDCTL_COLOR"] = false;
    userEnv["USER"] = user.name;
    userEnv["HOME"] = user.home;
    //user.env=userEnv;
    return userEnv;
}


/**
 * This function is async, and it will return a user object {uid,env} for the cookie.
 * if the user is not created before, it will create a new one within the container. 
 * @param {*} token a string of accessToken, will be used as a key for user mapping 
 */
module.exports.getUser = async (token) => {
    if(users[token] ){
        return users[token];
    }
    else{
        //user validation
        if(!INSECURE_MODE){
            debug('start user validation')
            try{
                await verifyAccessToken(token)
            }catch(e){
                debug('user token validation failed')
                throw e
            }
        }
        //create new user with home folder set
        //It's possible to have one user set up two different UIDs because we didn't add locks
        let user={accessToken:token};
        return createUser(user).then(()=>{
            //set uid to result
            debug('return uid:',user.uid);
            user.env=setupUserEnv(user);
            users[token]=user;
            return users[token];
        }).catch((e)=>{
            debug('failed in creating users:', e);
            throw e;
        })
    }
}