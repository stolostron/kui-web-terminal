/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const logging = require('../../../../dist/src-web/views/modes/logging')

const items = [
  {kind: require('../../../data/pod')},
]
const pod = items[0].kind.pod

// Resource's Logs tab
describe('logging mode', () => {
  let spy = jest.spyOn(logging, 'logTab')
  let _ = logging.logTab(pod)

  it('should render a tab entity for the resource log', () => {
    expect(spy).toBeCalled()
    expect(logging.logTab(pod)).toMatchSnapshot()
  })

  spy = jest.spyOn(logging, 'buildLog')
  _ = logging.buildLog(pod)

  it('should build a resource log node element', () => {
    expect(spy).toBeCalled()
    expect(logging.buildLog(pod)).toMatchSnapshot()
  })
})
