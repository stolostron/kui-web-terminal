/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const summary = require('../../../../dist/src-web/views/modes/summary')

const items = [
  {kind: require('../../../data/pod')},
]
const pod = items[0].kind.pod

// Resource's Summary tab
describe('summary mode', () => {
  let spy = jest.spyOn(summary, 'summaryTab')
  let _ = summary.summaryTab(pod)

  it('should render a tab entity for the resource summary', () => {
    expect(spy).toBeCalled()
    expect(summary.summaryTab(pod)).toMatchSnapshot()
  })

  spy = jest.spyOn(summary, 'buildSummary')
  _ = summary.buildSummary(pod)

  it('should build a resource summary node element', () => {
    expect(spy).toBeCalled()
    expect(summary.buildSummary(pod)).toMatchSnapshot()
  })
})
