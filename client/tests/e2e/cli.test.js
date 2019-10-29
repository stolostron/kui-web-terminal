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
    const loginPage = browser.page.LoginPage()
    if (process.env.TEST_URL && !process.env.TEST_URL.includes('localhost')) {
      loginPage.navigate()
      loginPage.authenticate()
    }
    KUI.navigate()
    KUI.waitForPageLoad(browser)
    KUI.verifyWebsocketConnection(browser)
  },

  'Verify supported CLIs can execute': browser => {
    const KUI = browser.page.KUI()
    const supportedClis = ['kubectl help', 'helm help', 'istioctl authn help', 'cloudctl']
    process.env.JOBNAME === 'AMD64' && supportedClis.push('oc')
    supportedClis.forEach(cli => {
      KUI.executeCommand(browser, cli)
      KUI.verifyOutputSuccess(browser)
    })
  },

  'Verify kubectl': browser => {
    const KUI = browser.page.KUI()
    const CLI = browser.page.CLI()
    const commands = ['get secrets', 'get deployments'] 
    commands.forEach(command => {
      KUI.executeCommand(browser, `kubectl ${command} -n kube-system`)
      CLI.verifyTableOutput(browser)
      KUI.verifyDetailSidecar(browser)
    })
  },

  'Verify oc': browser => {
    const KUI = browser.page.KUI()
    const CLI = browser.page.CLI()
    KUI.executeCommand(browser, 'oc get pods -n kube-system')
    CLI.verifyTableOutput(browser)
    KUI.verifyDetailSidecar(browser)
  },

  'Verify cloudctl': browser => {
    const KUI = browser.page.KUI()
    const CLI = browser.page.CLI()
    const commands = ['catalog charts', 'iam roles']
    commands.forEach(command => {
        KUI.executeCommand(browser, `cloudctl  ${command}`)
        CLI.verifyTableOutput(browser)
    })
  },

  'Verify helm': browser => {
    const KUI = browser.page.KUI()
    const CLI = browser.page.CLI()
    const commands = ['list', 'list repo']
    commands.forEach(command => {
      KUI.executeCommand(browser, `helm ${command}`)
      CLI.verifyTableOutput(browser)
      KUI.verifyDetailSidecar(browser)
    })
    const additional_commands = ['ls','init -c','repo list','create mychart','template mychart','version','install mychart --dry-run']
    additional_commands.forEach(command=>{
      KUI.executeCommand(browser, `helm ${command}`)
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
