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

  'Verify KUI getting started command': browser => {
    const KUI = browser.page.KUI()
    KUI.executeCommand(browser, 'getting started')
    KUI.verifySidecar()
  },

  'Verify cloudctl login success': browser => {
    const KUI = browser.page.KUI()
    const CLI = browser.page.CLI()
    KUI.executeCommand(browser, 'cloudctl tokens')
    CLI.verifyUserAuthenticated(browser)
  },

  'Verify supported themes': browser => {
    const KUI = browser.page.KUI()
    const themes = [{ name: 'IBM Dark' }, { name: 'IBM Light' }] // come back to this, evaluated color values keep changing
    KUI.executeCommand(browser, 'themes')
    themes.forEach(theme => KUI.verifyTheme(browser, theme))
  },

  'Verify product header': browser => {
    const KUI = browser.page.KUI()
    KUI.verifyProductHeader()
  },

  'Verify KUI multiple tabs': browser => {
    const KUI = browser.page.KUI()
    KUI.verifyNewTabs(browser)
  },

  after: function (browser, done) {
    setTimeout(() => {
      browser.end()
      done()
    })
  }
}
