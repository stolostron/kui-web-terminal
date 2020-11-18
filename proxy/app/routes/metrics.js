// Copyright (c) 2020 Red Hat, Inc.

'use strict'

const express = require('express')
const router = express.Router()
const metricTools = require('../lib/metricsUtils')

router.get('/', (req, res) => {
    console.log('/')
    res.sendStatus(200)
  })
  
router.get('/metrics', (req, res) => {
    console.log('/metrics' + ' call from Prometheus');
    res.set('Content-Type', metricTools.promClient.register.contentType);
    res.send(metricTools.promClient.register.metrics());
  })

module.exports = router