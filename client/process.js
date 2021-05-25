/*
 * Copyright Contributors to the Open Cluster Management project
 */

const proc = require('process/browser')

module.exports = proc

// Shim for 'process' needed when using webpack 5 for the client

exports.env = {
    HOME: '~'
}

let cwd = exports.env.HOME
exports.cwd = () => cwd

exports.chdir = dir => (cwd = dir)