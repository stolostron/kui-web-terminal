/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const { successSelector } = require('../config/selectors')

module.exports = {
  url: function () {
    return this.api.launchUrl
  },
  elements: {

  },
  commands: [{
    verifyUserAuthenticated,
    verifySupportedCLIs,
    verifyTableOutput
  }]
}

function verifyUserAuthenticated(browser) {
  const accessToken = successSelector + ' .entity-name[data-value="Access token:"]'
  const idToken = successSelector + ' .entity-name[data-value="ID token:"]'
  this.waitForElementPresent(successSelector)
  browser.assert.elementPresent(accessToken)
  browser.assert.elementPresent(idToken)
}

function verifySupportedCLIs(browser, cli) {
  browser.assert.elementPresent(`span[data-value="${cli}*"]`)
}
function verifyTableOutput(browser) {
  browser.assert.elementPresent('table.result-table'); 
}