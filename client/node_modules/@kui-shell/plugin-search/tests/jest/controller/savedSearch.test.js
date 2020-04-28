/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const search = require('../../../dist/src-web/controller/savedSearch')
const savedsearches = require('../../data/savedsearches')

const args = {
  argv: ['savedsearches'],
  command: 'savedsearches'
}

describe('Get query count', () => {
  const spy = jest.spyOn(search, 'getQueryCount')
  const _ = search.getQueryCount(savedsearches.data)

  expect(spy).toBeCalled()

  it('should get query count', () => {
    expect(search.getQueryCount(savedsearches.data)).toMatchSnapshot()
    expect(search.getQueryCount).toMatchSnapshot()
  })
})

describe('Saved Search command', () => {
  const spy = jest.spyOn(search, 'doSavedSearch')
  const _ = search.doSavedSearch(args)

  expect(spy).toBeCalled()

  it('should return saved searches', () => {
    expect(search.doSavedSearch(args)).toMatchSnapshot()
    expect(search.doSavedSearch).toMatchSnapshot()
  })
})

