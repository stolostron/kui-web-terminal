// Copyright (c) 2020 Red Hat, Inc.

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const url = require('url');
const https = require('https');
const querystring = require('querystring');
const NOBODY_GID = parseInt(process.env.NOBODY_GID || '99',10);
const child_process = require('child_process');
/* eslint-disable no-unused-vars*/

// This file provides some different classes for different envs KUI will exute on. Supports IBM CloudPak and Openshift.
// Each class should implement the following functions:
// getNamespace(accessToken) - async function returns a namespace for user login
// verifyAccessToken(accessToken) - async function verifies token and returns an idToken (can be empty string) for login if success, reject if failed to validate the token
// getLoginURL() - returns a url for cli login
// getLoginEnvs(userEnv,accessToken,idToken) - returns env vars which are necessary for login
// getLoginArgs(namespace,accessToken,idToken) - returns args which will be used for login
// getLoginCMD() - return the actual command executable path for login
// postSetup(user) - async function run some setup after successfully login

class CloudPakTools {
  constructor(){
    this.clusterURL = process.env['ICP_EXTERNAL_URL'] || 'https://mycluster.icp:8443';
    this.namespaceBlackList = ['cert-manager', 'ibmcom', 'istio-system', 'platform', 'services'];
  }

  getLoginURL(){
    return this.clusterURL;
  }
  getLoginArgs(namespace,accessToken,idToken){
    return ['login', '-a', this.clusterURL, '-n', namespace, '--skip-ssl-validation'];
  }
  getLoginEnvs(userEnv,accessToken,idToken){
    return Object.assign({}, userEnv,{'CLOUDCTL_ACCESS_TOKEN':accessToken,'CLOUDCTL_ID_TOKEN':idToken});
  }
  getLoginCMD(){
    return '/usr/local/bin/cloudctl';
  }
  postSetup(user){
    let config = {}
    try {
      config = require(`${user.env["HOME"]}/.cloudctl/cloudctl.json`)
    } catch(e) {
      console.error('failed to import cloudctl.json with error: ', e)
    }
    const kubeArgs = ['config', 'set-cluster', config['cluster-name'], '--server=https://kubernetes.default.svc:443', '--insecure-skip-tls-verify=true'];
    const kubeOpts = {
        cwd: user.env['HOME'],
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
      kubeProc.stdout.on('data', function (data) {
        kubeOutput += String(data);
      })
      kubeProc.stderr.on('data', function (data) {
        kubeOutput += String(data);
      })
      kubeProc.on('error', function (err) {
        console.error(user.name + ' kube api server rewrite failed.')
        console.error(err.toString())
      })
      kubeProc.on('exit', function (code) {
        if (code == 0) {
          console.log('user ' + user.name + ' kube api server rewrite success ')
          return resolve()
        }
  
        console.log('user ' + user.name + ' kube api server rewrite failed with exit code ' + code)
  
        let errMsg = ""
        const lines = kubeOutput.split('\n')
        for (let i = lines.length-1; i > 0; i--) { // account for possible blank line
          errMsg = lines[i]
          if (errMsg !== '') {
            break
          }
        }
        resolve(errMsg) // we won't fail the whole login
      })
    })
  }

  getNamespace(accessToken){
    const self=this;
    return new Promise(function (resolve, reject) {
      const userNamespaceUrl = url.parse(self.clusterURL + '/idmgmt/identity/api/v1/teams/resources');
      console.log('getting user namespaces with ' + userNamespaceUrl.href);
      let req = https.request({
        protocol: userNamespaceUrl.protocol,
        hostname: userNamespaceUrl.hostname,
        port: userNamespaceUrl.port,
        path: userNamespaceUrl.path,
        method: 'GET',
        rejectUnauthorized: false, // we are using the icp-management-ingress and it never has a valid cert for the service name
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Accept': 'application/json',
        },
        json: true,
      }, function (res) {
        let body = '';
        res.on('data', function (chunk) {
          body = body + chunk;
        });
        res.on('end', function () {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error('Unable to get user namspaces. Status code ' + res.statusCode + ' returned.'));
          }
          const resourceObj = JSON.parse(body)

          const namespaceList = resourceObj.filter(function (namespace) { 
            return (namespace.scope === 'namespace' && namespace.actions.includes('R'))
            })
          const namespacelistArr = namespaceList.map(function (namespacename) {
            return namespacename.namespaceId
            })

          if (namespacelistArr.length > 0) {
            const filteredArr = namespacelistArr.filter(function (str) {
              return str !== '' && !self.namespaceBlackList.includes(str)
            })

            if (filteredArr.length > 0) {
              console.log('selecting namespace: ', filteredArr[0])
              return resolve(filteredArr[0])
            }
            console.log('selecting namespace: ', namespaceList[0])
            return resolve(namespacelistArr[0])
          }
          reject(new Error('User does not have any namespaces.'));
        })
      });
      req.on('error', function (err) {
        reject(new Error(err.message));
      });
      req.end();
    })
  }
  verifyAccessToken(accessToken){
    const self = this
    return new Promise( (resolve, reject) =>{
      if (!accessToken) {
        return reject(new Error('Unable to verify user info. Access token is blank.'));
      }
      const userInfoUrl = url.parse(self.clusterURL + '/idprovider/v1/auth/exchangetoken');
      console.log('verify token with ' + userInfoUrl.href);
      const req = https.request({
        protocol: userInfoUrl.protocol,
        hostname: userInfoUrl.hostname,
        port: userInfoUrl.port,
        path: userInfoUrl.path,
        method: 'POST',
        rejectUnauthorized: false, // we are using the icp-management-ingress and it never has a valid cert for the service name
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        json: true,
        form: {
          access_token: accessToken
        }
      }, function (res) {
        let body = '';
        res.on('data', function (chunk) {
          body = body + chunk;
        });
        res.on('end', function () {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error('Unable to verify user info. Status code ' + res.statusCode + ' returned.'));
          }
          const json = JSON.parse(body);
          if (json.id_token) {
            return resolve(json.id_token);
          }
          reject(new Error('Unable to verify user info. No id_token in exchangetoken response.'));
        })
      });
      const data = querystring.stringify({
        'access_token': accessToken
      });
      req.write(data);
      req.on('error', function (err) {
        reject(new Error(err.message));
      });
      req.end();
    })
  }
}

class OpenshiftTools {
  constructor(){
    this.clusterURL = 'https://kubernetes.default.svc:443'
    if(process.env.NODE_ENV === 'development' && process.env.OPENSHIFT_API_SERVER){
      this.clusterURL = process.env.OPENSHIFT_API_SERVER
    }
  }

  getNamespace(accessToken){
    return Promise.resolve('default'); //this will not be used when login
  }
  verifyAccessToken(accessToken){
    if(accessToken){ //don't do any verification, leave work to actual `oc login`
      return Promise.resolve(accessToken); //return accesstoken as idtoken
    }
    return Promise.reject('accessToken not valid:',accessToken)
  }
  getLoginURL(){
    return this.clusterURL;
  }
  getLoginArgs(namespace,accessToken,idToken){
    return ['login', '--insecure-skip-tls-verify=true',`--server=${this.clusterURL}`,  `--token=${accessToken}`];
  }
  getLoginEnvs(userEnv,accessToken,idToken){
    return Object.assign({}, userEnv);

  }
  getLoginCMD(){
    return '/usr/local/bin/oc';
  }
  postSetup(user){ // do nothing after setup
    return Promise.resolve();
  }

}

exports.getLoginTools = ()=>{
  const UseCloudPakEnv = process.env.USE_CLOUDPAK_SETTINGS
  const UseCloudPak = UseCloudPakEnv? UseCloudPakEnv.toLowerCase() === 'true' :true // if not set or set to true, use cloudpak setups
  if(!UseCloudPak){
    return new OpenshiftTools();
  }
  return new CloudPakTools();
}



