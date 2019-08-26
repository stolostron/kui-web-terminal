/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {
    page: '.page',
    main: '.main',
    tabStripe: '.left-tab-stripe',
    commandInput: '.kui--input-stripe',
    inputBar: '.kui--input-stripe input',
    sidecar: '#sidecar',
    inputCommand: '.repl-input-element',
    commandOutput: '.repl-block[data-input-count="0"]'
  },
  commands: [{
    waitForPageLoad,
    verifyWebsocketConnection,
    executeCommand,
    verifyOutputSuccess,
    verifyOutputFailure,
    verifySidecar
  }]
}

// To make testing easier, we will clear command output and always check the first output
const outputSelector = '.repl-block[data-input-count="0"]'

function waitForPageLoad(browser) {
  this.api.pause(5000)
  browser.element('css selector', '.page', res => {
    res.status !== 0 && browser.source(result => console.log('Login page load failed, DOM: ', result.value)) // eslint-disable-line no-console
    this.waitForElementPresent('@page', 20000)
    this.waitForElementPresent('@main')
    this.waitForElementVisible('@tabStripe')
  })
}

function verifyWebsocketConnection(browser) {
  const successMsgSelector =  outputSelector + ' .repl-input-element'
  this.waitForElementPresent(successMsgSelector, 20000)
  browser.assert.value(successMsgSelector, 'ready')
}

function executeCommand(browser, command) {
  browser.perform(() => console.log('EXECUTING: ' + command))
  const { ENTER } = browser.Keys
  this.waitForElementPresent('@commandInput')
  this.waitForElementPresent('@inputBar')

  this.setValue('@inputBar', 'clear') // clean output
  browser.keys(ENTER)
  this.api.pause(500) // lag on enter press

  this.setValue('@inputBar', command) // input command
  browser.keys(ENTER)
  this.api.pause(500) // lag on enter press

  const selector = outputSelector + ' .repl-input-element'
  this.waitForElementPresent(selector, 10000)
  browser.assert.value(selector, command)

  this.waitForElementPresent(outputSelector + '.valid-response', 20000)
}

function verifyOutputSuccess(browser) {
  browser.assert.cssProperty(outputSelector + ' .kui--icon-error', 'display', 'none')
}

function verifyOutputFailure(browser) {
  browser.assert.cssProperty(outputSelector + ' .kui--icon-error', 'display', 'block')
}

function verifySidecar() {
  this.waitForElementVisible('@sidecar')
}
