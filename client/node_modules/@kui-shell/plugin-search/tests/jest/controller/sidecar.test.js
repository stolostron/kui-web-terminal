/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const fn = require('../../../dist/src-web/controller/sidecar')
const related = require('../../data/related')

const data = related.data
const resource = related.yaml

describe('Building Sidecar', () => {
  it('should build a resource sidecar with tabs [Summary, YAML, Related Resources]', () => {
    expect(fn.buildSidecar('resource', data, resource)).toMatchSnapshot()
  })

  it('should build a query sidecar with tabs [Related Resources]', () => {
    expect(fn.buildSidecar('query', data)).toMatchSnapshot()
  })
})
