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

const querystring = require('querystring'),
    url = require('url')

/**
 * Returns the full URL of the given request options, including qs request params (redacted).
 */
exports.requestUrl = function(options) {
  if (options.qs) {
    const qs = options.qs,
        query = []
    for (const i in qs) {
      if (Object.prototype.hasOwnProperty.call(qs, i)) {
        query.push(encodeURIComponent(i) + '=' + encodeURIComponent(options.qs[i]))
      }
    }
    if (query.length) {
      return options.url += '?' + query.join('&')
    }
  }
  return redactUrl(options.url)
}

/**
 * Serializes the incoming HTTP request. Body will be included if it's parsed (req.body).
 * Useful for printing out requests for debugging.
 */
exports.serializeIncomingRequest = function(req) {
  // request line
  let buf = [ req.method, ' ', redactUrl(req.originalUrl), ' HTTP/1.1\n' ]

  // headers
  if (req.headers) {
    for (const i in req.headers) {
      if (Object.prototype.hasOwnProperty.call(req.headers, i)) {
        const value = redactHeader(i, req.headers[i])
        buf.push(capitalizeHeaderName(i), ': ', value, '\n')
      }
    }
  }
  if (req.body && typeof req.body === 'string') {
    buf.push('\n', redactBody(req.body), '\n')
  }
  return buf.join('')
}

/**
 * Serializes the outgoing HTTP request described by the given "request" module options object.
 * Useful for printing out requests for debugging.
 */
exports.serializeRequest = function(options) {
  // request line
  let buf = [ (options.method || 'GET'), ' ', exports.requestUrl(options), ' HTTP/1.1\n' ]

  // headers
  if (options.json) {
    buf.push('Accept: application/json\n')
  }
  const isJSON = typeof options.json === 'object'
  const isForm = options.form
  if (isJSON) {
    buf.push('Content-Type: application/json\n')
  }
  else if (isForm) {
    buf.push('Content-Type: application/x-www-form-urlencoded\n')
  }
  for (const i in options.headers) {
    if (Object.prototype.hasOwnProperty.call(options.headers, i)) {
      const value = redactHeader(i, options.headers[i])
      buf.push(i, ': ', value, '\n')
    }
  }

  // body
  let body = options.body
  if (!body) {
    if (isJSON) {
      body = JSON.stringify(options.json)
    }
    else if (isForm) {
      body = querystring.stringify(options.form)
    }
  }
  if (body) {
    buf.push('\n', redactBody(body), '\n')
  }
  return buf.join('')
}

/**
 * Serializes the response from an outgoing HTTP request. Useful for printing out requests for
 * debugging.
 */
exports.serializeResponse = function(res) {
  // status line
  let buf = [ 'HTTP/', res.httpVersion, ' ', res.statusCode, '\n']

  // headers
  for (const i in res.headers) {
    if (Object.prototype.hasOwnProperty.call(res.headers, i)) {
      const value = redactHeader(i, res.headers[i])
      buf.push(capitalizeHeaderName(i), ': ', value, '\n')
    }
  }

  // body
  if (res.body) {
    const body = redactBody(typeof res.body === 'object' ? JSON.stringify(res.body) : res.body)
    buf.push('\n', body, '\n')
  }
  return buf.join('')
}

exports.getOptions = function(req, url) {
  return {
    url: url,
    qs: req.query
  }
}

/*
 * Capitalizes a lower-case header name, e.g. 'set-cookie' -> 'Set-Cookie'. Response headers
 * are only provided in lower-case, for some reason.
 */
function capitalizeHeaderName(headerName) {
  if (headerName.indexOf('x-com-ibm') === 0) {
    return 'X' + headerName.substring(1)
  }
  return headerName.replace(/([a-z])([a-z]*)/g, (match, p1, p2) => {
    return p1.toUpperCase() + p2
  })
}

/*
 * Remove any sensitive information from request/response body.
 */
function redactBody(body) {
  if (typeof body === 'string') {
    return body.replace(/("[^"]*password":)"[^"]*"/gi, '$1\"***\"'). // eslint-disable-line no-useless-escape
      replace(/("[^"]*access_token":)"[^"]*"/gi, '$1\"***\"') // eslint-disable-line no-useless-escape
  }
  return body
}

/*
 * Remove any sensitive information from http headers.
 */
function redactHeader(name, value) {
  name = name.toLowerCase()
  switch (name) {
  case 'authorization':
    // show the first word if there are multiple (e.g. 'Bearer', 'Basic')
    var words = value.split(' ')
    return words.length > 1 ? words[0] + ' ***' : '***'
  case 'cookie':
  case 'x-auth-token':
    return '***'
  }
  return value
}

/*
 * Remove any sensitive information from URLs.
 */
function redactUrl(urlParam) {
  try {
    let urlObj = url.parse(urlParam),
        query = urlObj.query
    if (query) {
      let queryObj = querystring.parse(query)
      for (const i in queryObj) {
        if (Object.prototype.hasOwnProperty.call(queryObj, i)) {
          switch (i) {
          case 'token':
            queryObj[i] = '***'
          }
        }
      }
      urlObj.query = querystring.stringify(queryObj)
      urlObj.search = '?' + urlObj.query
      return url.format(urlObj)
    }
    return urlParam
  } catch (e) {
    // couldn't parse url... skip redaction
    return urlParam
  }
}
