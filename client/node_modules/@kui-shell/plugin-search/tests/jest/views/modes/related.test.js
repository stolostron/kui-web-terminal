/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const related = require('../../../../dist/src-web/views/modes/related')

const items = [
  {kind: require('../../../data/configmaps')}
]
const configmap = items[0].kind.configmap

describe('Resources/Query sidecar', () => {
  // Resource's Related Resources tab
  describe('related mode', () => {
    const spy = jest.spyOn(related, 'relatedTab')
    const _ = related.relatedTab(configmap)

    it('should render a tab entity for the selected resource related resources', () => {
      expect(spy).toBeCalled()
      expect(related.relatedTab(configmap)).toMatchSnapshot()
    })
  })

  describe('build related', () => {
    const spy = jest.spyOn(related,  'buildRelated')
    let _  = related.buildRelated(configmap)

    it('should build a related resources node element - structured list', () => {
      expect(spy).toBeCalled()
      expect(related.buildRelated(configmap)).toMatchSnapshot()
    })

    _  = related.buildRelated(configmap, 'query')

    it('should build a related resources node element - clickable list', () => {
      expect(spy).toBeCalled()
      expect(related.buildRelated(configmap, 'query')).toMatchSnapshot()
    })
  })
})
