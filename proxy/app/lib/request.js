// Copyright (c) 2020 Red Hat, Inc.

/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

const httpUtil = require('./http-util')
let request = require('requestretry')

const REQUEST_DEFAULTS = {
  strictSSL: false,
  maxSockets: 200,
  timeout: 15 * 1000,
  maxAttempts: 5,
  retryDelay: 2500,
  retryStrategy: request.RetryStrategies.HTTPOrNetworkError
}

const FORWARD_HEADERS = {
  'Accept-Language': true,
  'Authorization': true,
  'X-Client-IP': true,
  'User-Agent': 'X-Client-User-Agent'
}

const defaultSlowThreshold = 10 * 1000

let requestNum = 1

/**
 * A convenience wrapper around the request module that adds SSO authentication,
 * error handling, logging, status code checking, and forwards the request locale.
 *
 * @see https://github.com/mikeal/request
 * @param options The options object for the underlying request call
 * @param req The inbound request, required to forward cookies for SSO
 * @param acceptedStatusCodes An array of acceptable status codes where the callback will be invoked;
 *	otherwise it will respond with an error
 * @param callback The usual callback, as per the request module
 * @param logger (Optional) A logger to use for logging requests and responses
 * @param slowThreshold (Optional) If the requests takes longer than this many milliseconds, a warning will be logged
 * @param reqOptions (Optional) Override the default request options
 */
module.exports = function (options, req, acceptedStatusCodes, callback, logger, slowThreshold, reqOptions) {
  request = request.defaults(reqOptions || REQUEST_DEFAULTS)
  slowThreshold = slowThreshold || defaultSlowThreshold
  const requestId = '#' + requestNum
  requestNum++
  if (req) {
    addRequestHeaders(options, req)
  }

  const agentOptions = options.agentOptions || {}
  agentOptions.securityOptions = 'SSL_OP_NO_SSLv3'
  agentOptions.secureProtocol = 'TLSv1_2_method'
  options.agentOptions = agentOptions
  const calledFrom = new Error('Called From:')

  if (logger) {
    logRequest(options, logger, requestId)
  }
  const startTime = new Date()

  request(options, (error, res, body) => {
    const endTime = new Date()
    if (error) {
      const error2 = new Error(getBodyMessage(body))
      error2.details = 'Error making request: ' + error + '\n' + httpUtil.serializeRequest(options) + '\n' + error + '\n'
      error2.statusCode = error.statusCode
      callback(error2, res, body)
      return
    }
    if (logger) {
      const duration = endTime - startTime
      if (duration >= slowThreshold) {
        logSlowResponse(options, res, logger, duration)
      }
      logResponse(res, options, logger, requestId, duration)
    }

    // check if response has an acceptable status code
    if (acceptedStatusCodes.indexOf(res.statusCode) !== -1) {
      try {
        callback(null, res, body)
      } catch (error3) {
        if (logger) {
          logger.error([
            'Error processing response from ', (options.method || 'GET'), ' ', httpUtil.requestUrl(options), '\n',
            error3.stack, '\n',
            calledFrom.stack
          ].join(''))
        }
        if (req && req.res) {
          const res2 = req.res
          res2.status(500).send('Error: 500 Internal Server Error')
        }
      }
    } else {
      const invalidResponseError = new Error(getBodyMessage(body))
      invalidResponseError.statusCode = res.statusCode
      invalidResponseError.details = 'Unexpected response code ' + res.statusCode + ' from request:\n' + httpUtil.serializeRequest(options) + '\n' + httpUtil.serializeResponse(res)
      invalidResponseError.message = (body.error && body.error.message) || body.message
      callback(invalidResponseError, res, body)
    }
  })
}

function getBodyMessage(body) {
  if (body && body.message) {
    return body.message
  }
  if (typeof body === 'string' || body instanceof String) {
    try {
      const jsonBody = JSON.parse(body)
      return jsonBody ? jsonBody.message : ''
    } catch (syntaxErrorException) {
      return ''
    }
  }
  return ''
}

function addRequestHeaders(options, req) {
  for (const i in FORWARD_HEADERS) {
    if (Object.prototype.hasOwnProperty.call(FORWARD_HEADERS, i)) {
      const value = req.get(i)
      if (value) {
        // forward headers as-is if true, or renamed if new name is specified
        const name = (FORWARD_HEADERS[i] === true) ? i : FORWARD_HEADERS[i]
        addHeader(options, name, value)
      }
    }
  }
}

function addHeader(options, name, value) {
  let headers = options.headers
  if (!headers) {
    headers = options.headers = {}
  }
  headers[name] = value
}

function logRequest(options, logger, requestId) {
  if (logger.isDebugEnabled()) {
    const requestStr = httpUtil.serializeRequest(options)
    logger.debug('request ' + requestId + '\n' + requestStr)
  }
}

function logResponse(res, options, logger, requestId, duration) {
  if (logger.isDebugEnabled()) {
    const responseStr = httpUtil.serializeResponse(res)
    logger.debug('response ' + requestId + ' - ' + duration + ' ms\n' + responseStr)
  } else if (logger.isInfoEnabled()) {
    logger.info([(options.method || 'GET'), ' ', httpUtil.requestUrl(options), ' ', res.statusCode, ' HTTP/1.1 (', duration, ' ms)'].join(''))
  }
}

function logSlowResponse(options, res, logger, duration) {
  logger.warn('Slow response from request ' + httpUtil.requestUrl(options) + ' (' + duration + ' ms)')
}
