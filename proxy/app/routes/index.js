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

})

module.exports = router
