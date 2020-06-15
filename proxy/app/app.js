/*
 * Copyright (c) 2020 Red Hat, Inc.
 */

 /*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
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

const express = require('express')
const expressStaticGzip = require("express-static-gzip");
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const crypto = require('crypto');
const csp = require('helmet-csp')
const consolidate = require('consolidate')
const proxy = require('http-proxy-middleware')

const ExecRouter = require('./routes/exec')
const defaultRoute = require('./routes/index')
const statusRoute = require('./routes/status')

const app = express()

app.disable('x-powered-by')

app.engine('dust', consolidate.dust)
app.set('env', 'production')
app.set('views', __dirname + '/views')
app.set('view engine', 'dust')
app.set('view cache', true)

// generate nonce for cps
app.use((req, res, next)=>{
  res.locals.nonce = crypto.randomBytes(16).toString('base64')
  next()
})
// setup csp
app.use(csp({
  // Specify directives as normal.
  directives: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self'", "'unsafe-inline'","'unsafe-eval'",(req, res) => `'nonce-${res.locals.nonce}'`],
    styleSrc: ["'self'","'unsafe-inline'"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'",'wss:'],
    imgSrc: ["'self'", 'data:',(req, res) => `'nonce-${res.locals.nonce}'`],
    upgradeInsecureRequests: true,
    workerSrc: false  // This is not set.
  },

  // This module will detect common mistakes in your directives and throw errors
  // if it finds any. To disable this, enable "loose mode".
  loose: false,

  // Set to true if you only want browsers to report errors, not block them.
  // You may also set this to a function(req, res) in order to decide dynamically
  // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
  reportOnly: false,

  // Set to true if you want to blindly set all headers: Content-Security-Policy,
  // X-WebKit-CSP, and X-Content-Security-Policy.
  setAllHeaders: true,

  // Set to true if you want to disable CSP on Android where it can be buggy.
  disableAndroid: false,

  // Set to false if you want to completely disable any user-agent sniffing.
  // This may make the headers less compatible but it will be much faster.
  // This defaults to `true`.
  browserSniff: true
}))


// app.use(compression())
app.use(express.json())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  const contextPath = '/' + process.env.KUI_INGRESS_PATH

  app.use((req, res, next) => {
    const cookie = `acm-access-token-cookie=${process.env.AUTH_TOKEN}`
    req.headers.cookie = cookie
    next()
  })

  app.use('/multicloud/header', cookieParser(), proxy({
    target: process.env.ICP_EXTERNAL_URL,
    changeOrigin: true,
    secure: false,
    ws: false
  }))

  app.use(`${contextPath}/api/proxy`, cookieParser(), proxy({
    target: process.env.ICP_EXTERNAL_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^${contextPath}/api/proxy`]: ''
    },
    secure: false
  }))
}


// helps with ctrl-c when running in a docker container
process.on('SIGINT', () => process.exit())

exports.setServer = (server, port) => {
  app.use('/kui/exec', ExecRouter(server, port))
  app.use('/status', statusRoute)
  app.use('/kui', defaultRoute)
  app.use('/kui', expressStaticGzip(path.join(__dirname, 'public')))
}

exports.app = app
