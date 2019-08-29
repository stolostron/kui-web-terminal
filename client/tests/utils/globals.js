/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const del = require('del')
const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')
const parser = require('xml2json')
const cwd = process.cwd()
const reportFolder = `${cwd}/test-output/`

/* eslint-disable no-console*/
module.exports = {

  // Controls time out for async hooks. Expects done() callback to be invoked within this time or an error is thrown.
  asyncHookTimeout: 60000,

  // External before hook is ran at the beginning of the tests run, before creating the Selenium session
  before: function(done) {
    del([reportFolder + '*', `${cwd}/selenium-debug.log`]).then(() => {
      console.log('Deleted test reports and logs.')
      done()
    })
  },

  // External after hook is ran at the very end of the tests run, after closing the Selenium session
  after: function(done) {
    done()
  },

  // This will be run before each test suite is started
  beforeEach: function(browser, done) {
    done()
  },

  // This will be run after each test suite is finished
  afterEach: function(browser, done) {
    setTimeout(() => {
      if (browser.sessionId) {
      browser.end()
        done()
      } else {
        done()
      }
    })
  }
}