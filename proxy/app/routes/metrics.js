// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

'use strict'

const express = require('express')
const router = express.Router()
const metricTools = require('../lib/metricsUtils')


router.get('/', (req, res) => {
    console.log('/metrics' + ' call from Prometheus');
    res.set('Content-Type', metricTools.promClient.register.contentType);
    res.send(metricTools.promClient.register.metrics());
  })

module.exports = router