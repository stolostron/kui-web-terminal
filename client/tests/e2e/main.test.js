
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
   },

   'Verify KUI loads': browser => {
      const KUI = browser.page.KUI()
      KUI.verifyPageLoad()
      KUI.executeCommand(browser, 'help')
      KUI.verifyCommandOutput(browser, 'help')
   },

   after: function (browser, done) {
    setTimeout(() => {
      browser.end()
      done()
    })
   }
 }
