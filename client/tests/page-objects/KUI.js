/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const chalk = require('chalk')
const { outputSelector, successSelector, resultInputSelector } = require('../config/selectors')

module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {
    pageLoading: '.still-loading',
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
    verifyOutputMessage,
    verifyTheme,
    verifySidecar
  }]
}

function waitForPageLoad(browser) {
  this.api.pause(5000)
  browser.element('css selector', '.page', res => {
    res.status !== 0 && browser.source(result => console.log(chalk.bold.red('Login page load failed, DOM: '), result.value)) // eslint-disable-line no-console
    this.waitForElementNotPresent('@pageLoading', 60000)
    this.waitForElementPresent('@page', 20000)
    this.waitForElementPresent('@main')
    this.waitForElementVisible('@tabStripe')
  })
}

function verifyWebsocketConnection(browser) {
  this.waitForElementPresent(successSelector, 60000)
  browser.assert.value(resultInputSelector, 'ready')
}

function executeCommand(browser, command) {
  browser.perform(() => console.log(chalk.bold.yellow('EXECUTING: ') + chalk.bold.cyan(command)))
  const { ENTER } = browser.Keys
  this.waitForElementPresent('@commandInput')
  this.waitForElementPresent('@inputBar')

  this.setValue('@inputBar', 'clear') // clean output
  browser.keys(ENTER)
  this.api.pause(500) // lag on enter press

  this.setValue('@inputBar', command) // input command
  browser.keys(ENTER)
  this.api.pause(500) // lag on enter press

  this.waitForElementPresent(resultInputSelector, 10000)
  browser.assert.value(resultInputSelector, command)

  this.waitForElementPresent(successSelector, 20000)
}

function verifyOutputSuccess(browser) {
  browser.assert.cssProperty(outputSelector + ' .kui--icon-error', 'display', 'none')
}

function verifyOutputFailure(browser) {
  browser.assert.cssProperty(outputSelector + ' .kui--icon-error', 'display', 'block')
}

function verifyOutputMessage(browser, message) {
  const preMsgSelector = outputSelector + ' .repl-result pre'
  const xtermMsgSelector = outputSelector + ' .xterm-container .xterm-rows div:first-of-type span'
  this.api.element('css selector', preMsgSelector, preRes => {
    if (preRes.status === 0) { // output is returned in a pre element
      browser.assert.containsText(preMsgSelector, message)
    } else {
      this.api.elements('css selector', xtermMsgSelector, xtermRes => {
        if (xtermRes.status === 0) { // output is returned xterm container one span per letter
          let msgText = ''
          xtermRes.value.forEach(element => this.api.elementIdText(element.ELEMENT, text => msgText += text.value))
          browser.perform(() => {
            if(!msgText.includes(message)) throw new Error(`${msgText} did not contain the text: "${message}"`)
          })
        }
      })
    }
  })
}

function verifyTheme(browser, theme) {
  const { name } = theme
  const themeButton = successSelector + ` .clickable span[title="${name}"]`
  this.waitForElementVisible(themeButton)
  this.click(themeButton)
  this.waitForElementVisible(`body[kui-theme="${name}"]`)
}

function verifySidecar() {
  this.waitForElementVisible('@sidecar')
}
