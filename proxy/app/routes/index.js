/*
 * Copyright (c) 2020 Red Hat, Inc.
 * Copyright Contributors to the Open Cluster Management project
 */

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

const express = require('express')
const router = express.Router()
// const headerClient = require('../lib/header-client')
const lodash = require('lodash')

/** GET home page. */
router.get('/', function (req, res, next) {
  if(req.path.endsWith('.js') || req.path.endsWith('.css')) {
    next()
    return
  }

  const nonce = res.locals.nonce || ''

  try {
    const langs = req.headers['accept-language'].split(',');
    res.render('main', Object.assign({
      kuiNonce: nonce,
      lang: langs[0]
    }))
  } catch(e) {
    console.error(e)
  }

  /*
  headerClient.getHeader(req, (err, headerRes) => {
    if (err) {
      console.error('Request for header failed: ', err)
      res.render('main', Object.assign({ header: '', propsH: '', stateH: '', filesH: '', kuiNonce: nonce }))
      console.log('finished render')
      return
    }

    const { headerHtml: header, props: propsH, state: stateH, files: filesH } = headerRes

    if (process.env.NODE_ENV === 'development') {
      lodash.forOwn(filesH, value => {
        value.path = `/kui/api/proxy${value.path}` //preprend with proxy route
      })
    }

    try {
      const langs = req.headers['accept-language'].split(',');
      res.render('main', Object.assign({
        header: header,
        propsH: propsH,
        stateH: stateH,
        filesH: filesH,
        kuiNonce: nonce,
        lang: langs[0]
      }))
    } catch(e) {
      console.error(e)
    }

  })
  */
})

module.exports = router
