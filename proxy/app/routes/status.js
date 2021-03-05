/*
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

router.get('/', (req, res) => {
  console.log('/')
  res.sendStatus(200)
})

router.get('/readinessProbe', (req, res) => {
  console.log('/readinessProbe')
  res.send(`Testing readinessProbe --> ${new Date().toLocaleString()}`)
})

router.get('/livenessProbe', (req, res) => {
  console.log('/livenessProbe')
  res.send(`Testing livenessProbe --> ${new Date().toLocaleString()}`)
})

module.exports = router
