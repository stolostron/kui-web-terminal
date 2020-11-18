// Copyright (c) 2020 Red Hat, Inc.

'use strict'

// Use the prom-client module to expose the metrics to Prometheus
const promClient = require('prom-client');

module.exports.promClient = promClient;

// session count metric
const sessionCounter = new promClient.Counter({
    name: 'visual_web_terminal_sessions_total',
    help: 'Count of Visual Web Terminal sessions created on the cluster',
    labelNames: ['clusterID']
});

module.exports.newSession = function(clusterID) {
    console.log("Incrementing session count metric for cluster " + clusterID);
    sessionCounter.inc({clusterID: clusterID});
}

