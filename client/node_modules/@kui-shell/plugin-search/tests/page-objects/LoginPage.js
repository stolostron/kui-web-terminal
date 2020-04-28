/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

module.exports = {
  url: function () {
    return `${this.api.launchUrl}`
  },
  elements: {
    username: '#username',
    password: '#password',
    submit: 'button[name="loginButton"]',
    error: '.bx--inline-notification--error',
    header: '.app-header',
    loginPage: '.login-container',
    pageContainer: '.page-content-container',
  },
   /* eslint-disable @typescript-eslint/no-use-before-define */
  commands: [{
    inputUsername,
    inputPassword,
    submit,
    authenticate,
    waitForLoginSuccess,
    waitForLoginPageLoad
  }]
}

// helper for other pages to use for authentication in before() their suit
function authenticate(user, password) {
  this.waitForLoginPageLoad()
  this.inputUsername(user)
  this.inputPassword(password)
  this.submit()
  this.waitForLoginSuccess()
}

function inputUsername(user) {
  this.waitForElementPresent('@username')
    .setValue('@username', user || process.env.K8S_CLUSTER_USER)
}

function inputPassword(password) {
  this.waitForElementPresent('@password')
    .setValue('@password', password || process.env.K8S_CLUSTER_PASSWORD)
}

function submit() {
  this.waitForElementPresent('@submit')
    .press('button[name="loginButton"]')
}

function waitForLoginSuccess() {
  this.waitForElementPresent('@header', 20000)
}

function waitForLoginPageLoad() {
  // The acceptInsecuretCerts config for Firefox doesn't work, so we have to click and accept
  this.api.element('css selector', '#errorPageContainer', res => {
    if (res.status !== -1) {
      this.waitForElementPresent('#advancedButton').press('#advancedButton')
      this.waitForElementPresent('#exceptionDialogButton').click('#exceptionDialogButton')
      this.waitForElementNotPresent('#errorPageContainer')
    }
    this.waitForElementPresent('@loginPage', 20000)
  })
}
