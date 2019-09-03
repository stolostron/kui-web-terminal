/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const a11yScan = require('../utils/accessibilityScan')

module.exports = {
  '@disabled': true, // turn back on for daily build
  before: function (browser) {
    const KUI =  browser.page.KUI()
    const loginPage = browser.page.LoginPage()
    if (process.env.TEST_URL && (!process.env.TEST_URL.includes('localhost'))) {
      loginPage.navigate()
      loginPage.authenticate()
    }
    KUI.navigate()
    KUI.waitForPageLoad(browser)
    KUI.verifyWebsocketConnection(browser)
  },

  'KUI Tables: Run Accessibility Scan': browser => {
    const command = 'kubectl get pods -n kube-system'
    exec(browser, command, 'kui-tables')
  },

  'KUI Sidecar: Run Accessibility Scan': browser => {
    const command = 'kubectl get deployment mcm-kui -o yaml -n kube-system'
    exec(browser, command, 'kui-sidecar')
  },

  after: function (browser, done) {
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

function exec(browser, command, name) {
  const KUI =  browser.page.KUI()
  KUI.executeCommand(browser, command)
  a11yScan.runAccessibilityScan(browser, name)
}