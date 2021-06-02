/*
 * Copyright Contributors to the Open Cluster Management project
 */

const proc = require('process/browser')

const HOME = '~'
let cwd = HOME

// Shim for 'process' needed when using webpack 5 for the client
module.exports = Object.assign(proc, {
    env: {
      HOME
    },
    cwd: () => cwd,
    chdir: dir => (cwd = dir)
})