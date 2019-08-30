/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const supportedClis = ['kubectl', 'helm', 'cloudctl', 'istioctl']
process.env.JOBNAME === 'AMD64' && supportedClis.push('oc')

module.exports = {
  before: function (browser) {
    const KUI =  browser.page.KUI()
    KUI.navigate()
    KUI.waitForPageLoad(browser)
    KUI.verifyWebsocketConnection(browser)
  },

  'Verify supported CLIs are installed': browser => {
    const KUI = browser.page.KUI()
    const CLI = browser.page.CLI()
    KUI.executeCommand(browser, 'ls /usr/local/bin')
    supportedClis.forEach(cli => CLI.verifySupportedCLIs(browser, cli))
  },

  'Verify supported CLIs can execute': browser => {
    const KUI = browser.page.KUI()
    supportedClis.forEach(cli => {
      KUI.executeCommand(browser, `${cli} help`)
      KUI.verifyOutputSuccess(browser)
    })
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
