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

  'Verify user home folder permissions': browser => {
    const KUI = browser.page.KUI()
    KUI.executeCommand(browser, 'pwd')
    KUI.verifyOutputMessage(browser, '/home/655')

    KUI.executeCommand(browser, 'cd ..')
    KUI.executeCommand(browser, 'ls')
    KUI.verifyOutputMessage(browser, 'Permission denied')
  },

  after: function (browser, done) {
    setTimeout(() => {
      browser.end()
      done()
    })
  }
}
