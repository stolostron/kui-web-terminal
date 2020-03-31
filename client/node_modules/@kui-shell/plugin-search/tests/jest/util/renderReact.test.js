/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const renderReact = require('../../../dist/src-web/util/renderReact')
const resource = require('../../data/pod')

describe('Rendering react components for searched query data table', () => {
  const node = document.createElement('div',  {is: 'react-entry-point'})
  node.classList.add('search-kui-plugin')

  const args = {
    command: 'search kind:pod'
  }

  const spy = jest.spyOn(renderReact, 'default')

  if(resource.data.items.length <= 0){
    it('should not render a data table', () => {
      expect(spy).not.toBeCalled()
    })
  }

  else{
    const _ = renderReact.default(resource.data.items, node, args.command)
    it('should render a data table', () => {
      expect(spy).toBeCalled()
      expect(resource.data.items).toBeDefined()
      expect(resource.data.items.length).not.toBe(0)
      expect(renderReact.default(resource.data.items, node, args.command)).toMatchSnapshot()
   })
  }
})
