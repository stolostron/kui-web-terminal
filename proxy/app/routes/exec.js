 /*
  * Copyright (c) 2020 Red Hat, Inc.
  * Copyright Contributors to the Open Cluster Management project
  */

 /*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2020. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

/*
 * Copyright 2019 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const debug = require('debug')('proxy/exec')
const { dirname, join } = require('path')
const { spawn } = require('child_process')
const express = require('express')
const { v4: uuid } = require('uuid')
const { parse: parseCookie } = require('cookie')
const {getUser,NOBODY_GID,deleteUser} = require('../lib/userUtils')


/* const { main } = require('../../kui/node_modules/@kui-shell/core')
const {
  setValidCredentials
} = require('../../kui/node_modules/@kui-shell/core/core/capabilities') */

const sessionKey = 'kui_websocket_auth'

const TokenFromCookieENV = process.env['TOKEN_FROM_COOKIE']
const TokenFromCookie = TokenFromCookieENV? TokenFromCookieENV.toLowerCase() !== 'false' : true
// if TokenFromCookieENV not set or is not false, will get token from cookie, otherwise, get token from header
const AccessTokenKey = (process.env['ACCESS_TOKEN_KEY'] || 'cfc-access-token-cookie').toLowerCase()

const mainPath = join(dirname(require.resolve('@kui-shell/core')), 'main/main.js')
const { main: wssMain } = require('@kui-shell/plugin-bash-like')
const { StdioChannelWebsocketSide } = require('@kui-shell/plugin-bash-like')

/** thin wrapper on child_process.exec */
function main(cmdline, execOptions, server, port, host,user, locale) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const { uid, gid } = {uid:user.uid,gid:NOBODY_GID}
    //check if uid/gid of session are the same as server side records

    // With new Kui v10 code, execOptions.env could be `~` which we also do not want, so rather than
    // setting cwd to execOptions.cwd value or user.env.HOME, just set it to user.env.HOME all the time
    // as that is what we want for a new user session anyway. Also, now pass that on PWD in the env also,
    // as well as the user's own HOME value (so as not to inherit HOME from execOptions.env).
    const options = {
      uid,
      gid,
      cwd: user.env.HOME,
      env: Object.assign(user.env, execOptions.env || {}, {
        LOCALE: locale,
        HOME: user.env.HOME,
        PWD: user.env.HOME,
        SHELL: 'rbash',
        DEBUG: process.env.DEBUG,
        DEVMODE: true,
        KUI_HEADLESS: true,
        KUI_REPL_MODE: 'stdout',
        KUI_EXEC_OPTIONS: JSON.stringify(execOptions),
        KUBE_EDITOR: 'rvim'
      })
    }

    const wsOpen = cmdline === 'bash websocket open'
    if (wsOpen) {
      // N is the random identifier for this connection
      const N = uuid()

      const session = {
        uid,
        gid,
        token: uuid() // use a different uuid for the session cookie
      }
      const sessionToken = Buffer.from(JSON.stringify(session)).toString('base64')
      const cookie = { key: sessionKey, session }

      const { wss } = await wssMain(N, server, port, cookie)

      const child = spawn(process.argv[0], [mainPath, 'bash', 'websocket', 'stdio'], options)

      child.on('error', err => {
        debug('subprocess error:', err)
        reject(err)
      })

      child.on('exit', code => {
        debug('subprocess exit', code)
        debug('deleting user data')
        //clean user data
        deleteUser(user.name).catch((e)=>{
          debug(`failed to delete ${user.name}:`,e)
        })
      })
      // check if the user connected within the time period
      let connectedInTime = false
      const connectionTimeout = process.env.KUI_WEBSOCKET_TIMEOUT || 60000
      console.log('connectionTimeout ', connectionTimeout)

      setTimeout(() => {
        if(!connectedInTime){
          console.log(`no websocket detected for ${uid}. cleaning process`)
          if(!child.killed){
            child.kill()
          }
        }
      },connectionTimeout)
      wss.on('connection',()=>{
        console.log('detected websocket connection for',uid)
        connectedInTime = true
      })

      const channel = new StdioChannelWebsocketSide(wss)
      await channel.init(child, process.env.KUI_HEARTBEAT_INTERVAL || 30000)

      channel.once('closed', (exitCode /* : number */) => {
        debug('channel closed',exitCode)
      })

      channel.once('open', () => {
        debug('channel open')

        const proto = process.env.KUI_USE_HTTP === 'true' ? 'ws' : 'wss'
        resolve({
          type: 'object',
          cookie: {
            key: sessionKey,
            value: sessionToken,
            path: process.env.KUI_INGRESS_PATH? `/${process.env.KUI_INGRESS_PATH}/bash/${N}`:`/bash/${N}`
          },
          response: {
            mode: 'raw',
            content: {
              proto,
              port: -1,
              path: (process.env.KUI_INGRESS_PATH !== undefined) ?
              `/${process.env.KUI_INGRESS_PATH}/bash/${N}` : `/bash/${N}`
            }
          }
        })
      })
    } else {
      debug ('reject plain exec:', cmdline, options)
      reject({statusCode:400,message:'Bad Request'})
    }
  })
}

/**
 *
 * @param server an https server
 * @param port the port on which that server is listening
 *
 */
module.exports = (server, port) => {
  debug('initializing proxy executor', port)

  const exec = commandExtractor =>
    async function(req, res) {
      // debug('hostname', req.hostname)
      // debug('headers', req.headers)
      let user={};
      try {
        const { command, execOptions = {} } = commandExtractor(req)
        debug('command', command)

        // so that our catch (err) below is used upon command execution failure
        execOptions.rethrowErrors = true

        const locale = req.headers['accept-language'] && req.headers['accept-language'].split(',')[0]

        /* if (execOptions && execOptions.credentials) {
          // F I X M E this should not be a global
          setValidCredentials(execOptions.credentials)
        } */

        /* const execOptionsWithServer = Object.assign({}, execOptions, {
          server,
          port,
          host: req.headers.host
          }) */

        const accessToken = TokenFromCookie? parseCookie(req.headers.cookie || '')[AccessTokenKey] : req.headers[AccessTokenKey] || '';

        user = await getUser(accessToken)
        const { type, cookie, response } = await main(
          command,
          execOptions,
          server,
          port,
          req.headers.host,
          user,
          locale
          )

        if (cookie) {
          res.cookie(cookie.key, cookie.value, {
            httpOnly: true, // clients are not allowed to read this cookie
            secure: process.env.KUI_USE_HTTP !== 'true', // https required?
            path: cookie.path // lock down the cookie to this channel's path
          })
        }

        // Explicitly set the response header value for Strict-Transport-Security (due to setting for
        // this in ../app.js does not seem to apply to the /kui/exec route as expected)
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        const code = response.code || response.statusCode || 200
        res.status(code).json({ type, response })
      } catch (err) {
        console.error('exception in command execution', err.code, err.message, err)
        //if user has been created, remove the user
        if(user && user.name && user.created){
          try{
            deleteUser(user.name)
          }catch(e){
            console.error('cannot delete user:',e)
          }
        }

        // Explicitly set the response header value for Strict-Transport-Security (due to setting for
        // this in ../app.js does not seem to apply to the /kui/exec route as expected)
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
        const possibleCode = err.code || err.statusCode
        const code = possibleCode && typeof possibleCode === 'number' && (possibleCode >=100 && possibleCode<=599)? possibleCode : 500
        res.status(code).send({type:'Error',response:(err.message || err)}) // use this format to match front-end
      }
    }

  const router = express.Router()


  /** POST exec */
  router.post('/', exec(req => req.body))

  return router
}
