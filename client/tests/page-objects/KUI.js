/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const chalk = require('chalk')
const { outputSelector, successSelector, resultInputSelector, failureSelector, failureOutputSelector } = require('../config/selectors')

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
    commandOutput: '.repl-block[data-input-count="0"]',
    header: '#header-container',
    hamburger: '#hamburger',
    leftNav: '#left-nav',
    newTabBtn: '.kui-new-tab__plus'
  },
  commands: [{
    waitForPageLoad,
    verifyWebsocketConnection,
    executeCommand,
    verifyOutputSuccess,
    verifyOutputFailure,
    verifySidecar,
    verifyErrorMessage,
    verifyOutputMessage,
    verifyTheme,
    verifyProductHeader,
    verifySidecar,
    verifyNewTabs
  }]
}


function waitForPageLoad(browser) {
  this.api.pause(5000)
  browser.element('css selector', '.page', res => {
    if( res.status !== 0 ){
      browser.source(result => {
        if (result.value.includes('Chromium Authors')) {
          console.log('ERROR:  DEFAULT CHROME PAGE')
        } else {
          console.log(chalk.bold.red('Login page load failed, DOM: '), result.value)
        }
      }) // eslint-disable-line no-console
    }
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

function verifyErrorMessage(browser, message) {
  this.waitForElementPresent(failureOutputSelector, 60000)
  browser.expect.element(failureOutputSelector).text.to.equal(message)
}

function executeCommand(browser, command, failed) {
  browser.perform(() => console.log(chalk.bold.yellow('EXECUTING: ') + chalk.bold.cyan(command)))
  const { ENTER } = browser.Keys
  this.waitForElementPresent('@commandInput')
  this.waitForElementPresent('@inputBar')

  this.setValue('@inputBar', 'clear') // clean output
  browser.setValue('.kui--input-stripe input', [ENTER])
  this.api.pause(500) // lag on enter press

  this.setValue('@inputBar', command) // input command
  browser.setValue('.kui--input-stripe input', [ENTER])
  this.api.pause(500) // lag on enter press

  this.waitForElementPresent(resultInputSelector, 10000)
  browser.assert.value(resultInputSelector, command)

  failed ? this.waitForElementPresent(failureSelector, 20000) : this.waitForElementPresent(successSelector, 20000)
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

function verifyProductHeader() {
  this.waitForElementPresent('@header')
  this.waitForElementPresent('@hamburger')
  this.click('@hamburger')
  this.waitForElementVisible('@leftNav')
  this.click('@hamburger')
  this.waitForElementNotPresent('@leftNav')
}

function verifyNewTabs(browser) {
  const KUI = browser.page.KUI()
  const firstTab = '.left-tab-stripe-buttons .kui-tab:nth-of-type(1)'
  const secondTab = '.left-tab-stripe-buttons .kui-tab:nth-of-type(2)'
  const firstTabContainer = '.tab-container tab:nth-of-type(1)'
  const secondTabContainer = '.tab-container tab:nth-of-type(2)'
  const tabCloseBtn = ' .left-tab-stripe-button-closer svg'
  this.waitForElementPresent('@newTabBtn')
  this.click('@newTabBtn') // open new tab
  this.waitForElementPresent(secondTab)
  this.waitForElementVisible(secondTabContainer)
  this.waitForElementNotVisible(firstTabContainer)
  KUI.verifyWebsocketConnection(browser) // verify websocket connects on new tab
  browser.assert.cssClassPresent(secondTab, 'kui-tab--active') // verify active tab
  browser.assert.cssClassNotPresent(firstTab, 'kui-tab--active')
  this.click(firstTab) // go back to first tab
  this.waitForElementVisible(firstTabContainer)
  this.waitForElementNotVisible(secondTabContainer)
  browser.assert.cssClassPresent(firstTab, 'kui-tab--active')
  browser.assert.cssClassNotPresent(secondTab, 'kui-tab--active')
  this.click(secondTab + tabCloseBtn) // close the second tab
  this.waitForElementNotPresent(secondTab)
  this.waitForElementNotPresent(secondTabContainer)
}

function verifySidecar() {
  this.waitForElementVisible('@sidecar')
}