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
  commands: [{
    inputUsername,
    inputPassword,
    submit,
    authenticate,
    waitForLoginSuccess,
    waitForLoginPageLoad
  }]
}

//helper for other pages to use for authentication in before() their suit
function authenticate(user, password) {
  this.waitForLoginPageLoad()
  this.inputUsername(user)
  this.inputPassword(password)
  this.submit()
  this.waitForLoginSuccess()
}

function inputUsername(user) {
  this.waitForElementVisible('@username')
    .setValue('@username', user || process.env.TEST_USER)
}

function inputPassword(password) {
  this.waitForElementVisible('@password')
    .setValue('@password', password || process.env.TEST_PWD)
}

function submit() {
  this.waitForElementVisible('@submit')
    .click('@submit')
}

function waitForLoginSuccess() {
  this.waitForElementVisible('@header', 20000)
}

function waitForLoginPageLoad() {
  this.waitForElementPresent('@loginPage', 20000)
}
