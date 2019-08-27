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

  'Verify commands are disabled - plugin-kui-addons': browser => {
    const bashLikeRoutes = ['git status','git diff'];
    const k8sRoutes = ['istio install','istio uninstall','istio ingress','istio status',
    'bookinfo install','bookinfo uninstall','bookinfo create',
    'kiali install','kiali delete','kiali console', 'kiali graph',
    'k8s kedit','k8s kdebug'];
    const coreSupportRoutes = ['run','window','window bigger','window smaller','window max','window unmax','window close','quit'];
    const bannedCommands = [...bashLikeRoutes, ...k8sRoutes, ...coreSupportRoutes]
    const KUI = browser.page.KUI()
    bannedCommands.forEach(command => {
      KUI.executeCommand(browser, command, true)
      KUI.verifyErrorMessage(browser, "Command is disabled")
    })
  },

  after: function (browser, done) {
    setTimeout(() => {
      browser.end()
      done()
    })
  }
}
