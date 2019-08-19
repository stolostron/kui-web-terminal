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
const headerClient = require('../lib/header-client')
const lodash = require('lodash')
const crypto = require('crypto');

/** GET home page. */
router.get('/', function (req, res, next) {
  if(req.path.endsWith('.js') || req.path.endsWith('.css')) {
    next()
    return
  }
  const nonce = crypto.randomBytes(16).toString('base64');
  headerClient.getHeader(req, (err, headerRes) => {
    if (err) {
      console.error('Request for header failed: ', err)
      return res.render('main', Object.assign({ header: '', propsH: '', stateH: '', filesH: '',kuiNonce: nonce}))
    }

    const { headerHtml: header, props: propsH, state: stateH, files: filesH } = headerRes
    if(process.env.NODE_ENV === 'development') {
      lodash.forOwn(filesH, value => {
        value.path = `/kui/api/proxy${value.path}` //preprend with proxy route
      })
    }
    try {
      res.render('main', Object.assign({
        header: header,
        propsH: propsH,
        stateH: stateH,
        filesH: filesH,
        kuiNonce: nonce
      }))

    } catch(e) {
      console.error(e)
    }

  })
})

module.exports = router
