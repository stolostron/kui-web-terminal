/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

module.exports = (settings => {

  if (process.env.TEST_LOCAL) {
    var defaultUrl = 'https://localhost:8081/kui'
  } else {
    var defaultUrl = process.env.ICP_EXTERNAL_URL
    defaultUrl = !defaultUrl.endsWith('/kui') ? `${defaultUrl}/kui` : defaultUrl
  }

  console.log('DEFAULT URL IS: ', defaultUrl) // eslint-disable-line no-console
  settings.test_settings.default.launch_url = defaultUrl
  return settings

})(require('./nightwatch.json'))
