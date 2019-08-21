
/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/


 module.exports = {
    before: function (browser) {
    const KUI =  browser.page.KUI()
    KUI.navigate()
    KUI.waitForPageLoad(browser)
    KUI.verifyWebsocketConnection(browser)
  },

  'Verify KUI help command': browser => {
    const KUI = browser.page.KUI()
    KUI.executeCommand(browser, 'help')
  },

  'Verify KUI getting started command': browser => {
    const KUI = browser.page.KUI()
    KUI.executeCommand(browser, 'getting started')
    KUI.verifySidecar()
  },

  after: function (browser, done) {
    setTimeout(() => {
      browser.end()
      done()
    })
  }
 }
