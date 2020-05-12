/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const queries = require('../../../dist/src-web/definitions/search-queries')
const HTTPClient = require('../../../dist/src-web/controller/HTTPClient')

const svc = 'svc'
const search = 'search'

describe('HTTP Client - POST', () => {
  const spy = jest.spyOn(HTTPClient, 'default')
  const _ = HTTPClient.default('post', search, queries.SAVED_SEARCH_QUERY).then(data => Promise.resolve(data))

  it(`return a axios request object with urlType - [${search}] - POST`, () => {
    expect(spy).toBeCalled()
    expect(HTTPClient.default).toMatchSnapshot()
  })
})


describe('HTTP Client - GET', () => {
  const spy = jest.spyOn(HTTPClient, 'default')
  const _ = HTTPClient.default('get', svc, undefined).then(data => Promise.resolve(data))

  it(`return a axios request object with urlType - [${svc}] - GET`, () => {
    expect(spy).toBeCalled()
    expect(HTTPClient.default).toMatchSnapshot()
  })
})
