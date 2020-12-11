// Copyright (c) 2020 Red Hat, Inc.

'use strict'

const express = require('express')
const router = express.Router()
const metricTools = require('../lib/metricsUtils')

// EXPERIMENT EXPERIMENT
const childProcess=require('child_process');
const { parse: parseCookie } = require('cookie')
const CLUSTER_VERSION_TIMEOUT = 10000;
const TokenFromCookieENV = process.env['TOKEN_FROM_COOKIE']
const TokenFromCookie = TokenFromCookieENV? TokenFromCookieENV.toLowerCase() !== 'false' : true
// if TokenFromCookieENV not set or is not false, will get token from cookie, otherwise, get token from header
const AccessTokenKey = process.env['ACCESS_TOKEN_KEY']
// const NOBODY_GID = parseInt(process.env.NOBODY_GID || '99',10);
let CID = ''
// const accessToken = TokenFromCookie? parseCookie(req.headers.cookie || '')[AccessTokenKey] : req.headers[AccessTokenKey] || '';

// This function is used to get the clusterID of the cluster where Visual Web Terminal is deployed
// and cache it.  This is only needed to be done once when the pod is started and will be triggered
// to run when the readinessProbe is called.
const getClusterID = (accessToken) => {
  // Use the loginTools environment info as it is the same as what we need to run the oc command
  // const cmdEnv = loginTools.getLoginEnvs(user.env, accessToken, idToken);
  // const cmdOpts = {
  //   cwd: cmdEnv['HOME'],
  //   env: cmdEnv,
  //   timeout: CLUSTER_VERSION_TIMEOUT,
  //   uid: user.uid,
  //   gid: NOBODY_GID
  // };
  return new Promise(function (resolve, reject) {
    // Spawn a child process that just runs the following command to retrieve the clusterID (documented in OCP documentation)
    //   oc get clusterversion -o jsonpath='{.items[].spec.clusterID}' --token='accessToken'
    const access = "--token='" + accessToken + "'"
    const clusterIDProc = childProcess.spawn('/usr/local/bin/oc', ["get", "clusterversion", "-o", "jsonpath='{.items[].spec.clusterID}'", access]);
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
        const outputLines = clusterVersionOutput.split('\n');
        CID = (outputLines.length > 0) ? outputLines[outputLines.length - 1].replace(/'/g,'') : "";
        console.log('From first /metrics request, clusterID = ' + CID);
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
// END EXPERIMENT


router.get('/', (req, res) => {
    // Check if this is the first time Prometheus is querying metrics and we have not cached the clusterID yet
    // to initialize the metrics that use it as a label value
    if (CID.length == 0) {
      const accessToken = TokenFromCookie? parseCookie(req.headers.cookie || '')[AccessTokenKey] : req.headers[AccessTokenKey] || '';
      console.log('First call to /metrics');
      (async () => {
        await getClusterID(accessToken);
        // Now that we have cached the clusterID, notify metrics a new session was created
        // metricTools.newSession(clusterID);
      })();
    }
    console.log('/metrics' + ' call from Prometheus');
    res.set('Content-Type', metricTools.promClient.register.contentType);
    res.send(metricTools.promClient.register.metrics());
  })

module.exports = router