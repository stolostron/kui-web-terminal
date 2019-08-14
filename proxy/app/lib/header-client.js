/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

var request = require('./request')
var httpUtil = require('./http-util')

const PLATFORM_HEADER_CONTEXT_PATH = '/header'

exports.getHeader = (req, cb) => {
  const options = httpUtil.getOptions(req, `${process.env.ICP_EXTERNAL_URL}${PLATFORM_HEADER_CONTEXT_PATH}/api/v1/header?serviceId=kui&dev=false`)
  const cookie = `cfc-acs-auth-cookie=${process.env.AUTH_TOKEN}; cfc-access-token-cookie=${process.env.AUTH_TOKEN}`

  options.headers = {
    "Accept-Language": req.headers['accept-language'],
    Cookie: process.env.NODE_ENV === 'development' ? cookie : req.headers.cookie,
   }

  request(options, null, [200, 201, 204], (err, result) => {
    if (err) {
      return cb(err, null)
    }

    cb(err, JSON.parse(result.body))
  })
}
