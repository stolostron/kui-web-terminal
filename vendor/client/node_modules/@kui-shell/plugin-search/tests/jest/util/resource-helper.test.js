/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const helper = require('../../../dist/src-web/util/resource-helper')

const items = [
  {
    "kind": "pod",
    "name": "fake-name",
    "namespace": "kube-system",
    "cluster": "local-cluster",
    "created": "2019-09-17T18:13:28Z",
  },
  {
    "kind": "pod",
    "name": "fake-name2",
    "namespace": "kube-system",
    "cluster": "local-cluster",
    "created": "2019-09-17T18:00:29Z",
  }
]

describe('Resource helper getAge', () => {
  items.forEach(item => {
    const spy = jest.spyOn(helper, 'getAge')
    const _ = helper.getAge(item, null, 'created')

    it(`should get the age of ${item.name} from the moment it was created (${item.created})`, () => {
      expect(spy).toBeCalled()
      expect(helper.getAge(item, null, 'created')).toMatchSnapshot()
    })
  })
})
