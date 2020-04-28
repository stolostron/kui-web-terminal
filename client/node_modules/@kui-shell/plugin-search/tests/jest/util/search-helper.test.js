/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const helper = require('../../../dist/src-web/util/search-helper')

describe('Search helper', () => {
  const commands = [
    'search kind:pod,deployment namespace:kube-system',
    'search summary kind:pod name:nvidia-device-plugin-r2674 namespace:kube-system',
    'search related:resources kind:pod',
    'search pod,deployment',
    'search -h',
    'search completions:=1'
  ]
  commands.forEach(command => {
    const spy = jest.spyOn(helper, 'convertStringToQuery')
    const _ = helper.convertStringToQuery(command)

    it(`should convert ${command} to a query`, () => {
      expect(spy).toBeCalled()
      expect(helper.convertStringToQuery(command)).not.toBeUndefined()

      expect(helper.convertStringToQuery(command)).toEqual(
        expect.objectContaining({
          filters: expect.any(Array),
          keywords: expect.any(Array)
        })
      )

      expect(helper.convertStringToQuery(command)).toMatchSnapshot()
    })
  });
})


