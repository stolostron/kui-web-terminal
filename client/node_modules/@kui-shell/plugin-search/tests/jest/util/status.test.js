/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const status = require('../../../dist/src-web/util/status')

const spy = jest.spyOn(status, 'getStatusIcon')
const _ = status.getStatusIcon()

const data = ['OK', 'Unknown', 'OOMKilled', 'Pending', 'Completed']

status.status.map((stat) => {
  describe('Return status', () => {
    it(`- ${stat.type}`, () => {
      expect(stat.values).toMatchSnapshot()
      expect(stat.icon).toMatchSnapshot()
    })
  })
})

describe('Get Status Icons', () => {
  data.map((val) => {
    const type = status.status.filter((stat) => stat.values.includes(val))
    it(`should return correct status icon for the given value (${val})`, () => {
      expect(spy).toBeCalled()
      expect(status.getStatusIcon(val)).toEqual(type[0].icon)
    })
  })
})