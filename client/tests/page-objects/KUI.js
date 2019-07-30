
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
    inputCommand: '.repl-input-element'
  },
  commands: [{
    verifyPageLoad,
    executeCommand,
    verifySidecar,
    verifyCommandOutput
  }]
}

function verifyPageLoad() {
  this.waitForElementPresent('@page')
  this.waitForElementPresent('@main')
  this.waitForElementVisible('@tabStripe')
}

function executeCommand(browser, command) {
  const { ENTER } = browser.Keys
  this.waitForElementPresent('@commandInput')
  this.waitForElementPresent('@inputBar')
  this.setValue('@inputBar', command)
  browser.keys(ENTER)
}

function verifyCommandOutput(browser, command) {
  this.waitForElementPresent('@inputCommand')
  browser.assert.value('.repl-input-element', command)
}

function verifySidecar() {
  this.waitForElementVisible('@sidecar')
}
