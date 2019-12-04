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
const cors = require('cors')
const consolidate = require('consolidate')
const proxy = require('http-proxy-middleware')

const ExecRouter = require('./routes/exec')
const defaultRoute = require('./routes/index')
const statusRoute = require('./routes/status')
const {setupWSS} = require('./routes/terminal')

const app = express()

app.engine('dust', consolidate.dust)
app.set('env', 'production')
app.set('views', __dirname + '/views')
app.set('view engine', 'dust')
app.set('view cache', true)

// app.use(compression())
app.use(cors(
  // TODO cors config, e.g.
  // { origin: 'https://localhost:8080' }
))
app.use(express.json())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
  const contextPath = '/' + process.env.KUI_INGRESS_PATH

  app.use((req, res, next) => {
    const cookie = `cfc-acs-auth-cookie=${process.env.AUTH_TOKEN}; cfc-access-token-cookie=${process.env.AUTH_TOKEN}`
    req.headers.cookie = cookie
    next()
  })

  app.use('/common-nav', cookieParser(), proxy({
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

exports.setServer = (server) => {
  app.use('/kui/exec', ExecRouter())
  app.use('/status', statusRoute)
  app.use('/kui', defaultRoute)
  app.use('/kui', expressStaticGzip(path.join(__dirname, 'public')))
  setupWSS(server);
}

exports.app = app
