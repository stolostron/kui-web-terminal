/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const ICP_EXTERNAL_URL = process.env["ICP_EXTERNAL_URL"] || "https://mycluster.icp:8443";
const url = require('url');
const https = require('https');
const querystring = require('querystring');
const NS_BLACKLIST = ["cert-manager", "ibmcom", "istio-system", "platform", "services"]

module.exports.ICP_EXTERNAL_URL = ICP_EXTERNAL_URL;

module.exports.getNamespace = (accessToken) => {
  return new Promise(function (resolve, reject) {
    const userNamespaceUrl = url.parse(ICP_EXTERNAL_URL + "/idmgmt/identity/api/v1/teams/resources");
    console.log("getting user namespaces with " + userNamespaceUrl.href);
    let req = https.request({
      protocol: userNamespaceUrl.protocol,
      hostname: userNamespaceUrl.hostname,
      port: userNamespaceUrl.port,
      path: userNamespaceUrl.path,
      method: "GET",
      rejectUnauthorized: false, // we are using the icp-management-ingress and it never has a valid cert for the service name
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Accept": "application/json",
      },
      json: true,
    }, function (res) {
      let body = "";
      res.on('data', function (chunk) {
        body = body + chunk;
      });
      res.on('end', function () {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error("Unable to get user namspaces. Status code " + res.statusCode + " returned."));
        }
        let resourceObj = JSON.parse(body)

        let namespaceList = resourceObj.filter(function(namespace) { return namespace.scope == "namespace" && namespace.actions.includes("R") })
        let namespacelistArr = namespaceList.map(function(namespacename){ return namespacename.namespaceId })

        if (namespacelistArr.length > 0) {          
          let filteredArr = namespacelistArr.filter(function(str) { return str != "" && !NS_BLACKLIST.includes(str) })

          if (filteredArr.length > 0) {
            console.log("selecting namespace: ", filteredArr[0])
            return resolve(filteredArr[0])
          }
          console.log("selecting namespace: ", namespaceList[0])
          return resolve(namespacelistArr[0]) 
        }
        reject(new Error("User does not have any namespaces."));
      })
    });
    req.on('error', function (err) {
      reject(new Error(err.message));
    });
    req.end();    
 })
}

module.exports.getHighestRole = (accessToken) => {
  return new Promise(function (resolve, reject) {
    const getAccountsUrl = url.parse(ICP_EXTERNAL_URL + "/idmgmt/identity/api/v1/teams/highestRole");
    console.log("getting user account with " + getAccountsUrl.href);
    let req = https.request({
      protocol: getAccountsUrl.protocol,
      hostname: getAccountsUrl.hostname,
      port: getAccountsUrl.port,
      path: getAccountsUrl.path,
      method: "GET",
      rejectUnauthorized: false, // we are using the icp-management-ingress and it never has a valid cert for the service name
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Accept": "application/json",
      },
      json: true,
    }, function (res) {
      let body = "";
      res.on('data', function (chunk) {
        body = body + chunk;
      });
      res.on('end', function () {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error("Unable to get highest role. Status code " + res.statusCode + " returned."));
        }
        
        if(!body){
          reject(new Error("User does not have any role.")); 
        }
        console.log("getHighestRole:",body);
        //return the first account for user to use
        return body;
      });
    });
    req.on('error', function (err) {
      reject(new Error(err.message));
    });
    req.end();    
 }); 
}

module.exports.getAccount = (accessToken) => {
  return new Promise(function (resolve, reject) {
    const getAccountsUrl = url.parse(ICP_EXTERNAL_URL + "/idmgmt/identity/api/v1/account");
    console.log("getting user account with " + getAccountsUrl.href);
    let req = https.request({
      protocol: getAccountsUrl.protocol,
      hostname: getAccountsUrl.hostname,
      port: getAccountsUrl.port,
      path: getAccountsUrl.path,
      method: "GET",
      rejectUnauthorized: false, // we are using the icp-management-ingress and it never has a valid cert for the service name
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Accept": "application/json",
      },
      json: true,
    }, function (res) {
      let body = "";
      res.on('data', function (chunk) {
        body = body + chunk;
      });
      res.on('end', function () {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error("Unable to get user accounts. Status code " + res.statusCode + " returned."));
        }

        let resourceObj = {};
        try{
          resourceObj = JSON.parse(body);
        }catch(e){
          return reject(new Error("Unable to parse results." ));
        }
        
        if(resourceObj.length === 0){
          reject(new Error("User does not have any account.")); 
        }
        if(!resourceObj[0] || !resourceObj[0].id){
          reject(new Error("Account doesn't contain any id"));
        }
        //return the first account for user to use
        return resourceObj[0].id;
      });
    });
    req.on('error', function (err) {
      reject(new Error(err.message));
    });
    req.end();    
 });
};


module.exports.verifyAccessToken = (accessToken) => {
    return new Promise(function (resolve, reject) {
      if (!accessToken) {
        return reject(new Error("Unable to verify user info. Access token is blank."));
      }
      const userInfoUrl = url.parse(ICP_EXTERNAL_URL + "/idprovider/v1/auth/exchangetoken");
      console.log("verify token with " + userInfoUrl.href);
      let req = https.request({
        protocol: userInfoUrl.protocol,
        hostname: userInfoUrl.hostname,
        port: userInfoUrl.port,
        path: userInfoUrl.path,
        method: "POST",
        rejectUnauthorized: false, // we are using the icp-management-ingress and it never has a valid cert for the service name
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
        },
        json: true,
        form: {
          access_token: accessToken
        }
      }, function (res) {
        let body = "";
        res.on('data', function (chunk) {
          body = body + chunk;
        });
        res.on('end', function () {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(new Error("Unable to verify user info. Status code " + res.statusCode + " returned."));
          }
          let json = JSON.parse(body);
          if (json.id_token) {
            return resolve(json.id_token);
          }
          reject(new Error("Unable to verify user info. No id_token in exchangetoken response."));
        })
      });
      let data = querystring.stringify({
        'access_token': accessToken
      });
      req.write(data);
      req.on('error', function (err) {
        reject(new Error(err.message));
      });
      req.end();
    })
  }