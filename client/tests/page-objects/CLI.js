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

  },
  commands: [{
    verifySupportedCLIs
  }]
}

function verifySupportedCLIs(browser, cli) {
  browser.assert.elementPresent(`span[data-value="${cli}*"]`)
}
