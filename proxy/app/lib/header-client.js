/*
 * Copyright (c) 2020 Red Hat, Inc.
 */

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

const request = require('./request')
const httpUtil = require('./http-util')

const HEADER_CONTEXT_PATH = '/multicloud/header'
const HEADER_URL = process.env.HEADER_SERVICE || process.env.ICP_EXTERNAL_URL

exports.getHeader = (req, cb) => {

  if(process.env.NODE_ENV === 'development'){
    return cb(true)
  }

  const options = httpUtil.getOptions(req, `${HEADER_URL}${HEADER_CONTEXT_PATH}/api/v1/header?serviceId=kui&dev=false`)
  const cookie = `acm-access-token-cookie=${process.env.AUTH_TOKEN}`
  const acmToken = req.cookies && req.cookies['acm-access-token-cookie']
  options.headers = {
    'Accept-Language': req.headers['accept-language'],
    Cookie: process.env.NODE_ENV === 'development' ? cookie : req.headers.cookie,
    Authorization: req.headers.Authorization || req.headers.authorization || `Bearer ${acmToken}`,
   }

  request(options, null, [200, 201, 204], (err, result) => {
    if (err) {
      return cb(err, null)
    }
    try{
      const jsonObj=JSON.parse(result.body)
      cb(err,jsonObj)
    }catch(e){
      return cb(e,null)
    }

  })
}
