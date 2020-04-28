/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const actionHandler = require('../../../dist/src-web/controller/actionHandler')

describe('Search action handler', () => {
  const name = 'All Fake Pods'
  const notification = {
    success: {
      content: `Successfully deleted saved search ${name}`
    },
    warning: {
      warning: `Warning - saved search ${name} was not found! Check saved searches`
    },
    error: {
      message: `Failed to delete saved search ${name}`,
    }
  }

  describe('Delete saved searches', () => {
    const args =  {
      command: `deleteSavedSearch ${name}`,
      argv: ['deleteSavedSearch', name]
    }

    const spy = jest.spyOn(actionHandler, 'deleteSavedSearch')
    const _ = actionHandler.deleteSavedSearch(args)

    it('should delete a saved search', () => {
      expect(spy).toBeCalled()
      expect(actionHandler.deleteSavedSearch).toMatchSnapshot()
    })
  })

  describe('Delete resources', () => {
    const args =  {
      command: 'deleteResource fake-name fake-namespace fake-kind fake-cluster fake-selfLink',
      argv: ['deleteResource', 'fake-name', 'fake-namespace', 'fake-kind', 'fake-cluster', 'fake-selfLink']
    }

    const spy = jest.spyOn(actionHandler, 'deleteResource')
    const _ = actionHandler.deleteResource(args)

    it('should delete a resource', () => {
      expect(spy).toBeCalled()
      expect(actionHandler.deleteResource).toMatchSnapshot()
    })
  })

  describe('Notifications', () =>  {
    const constantDate = new Date('2020-01-01T12:00:00')

    beforeAll(() => {
      global.Date = class extends Date {
        constructor () {
          super()
          return constantDate
        }
      }
    })

    it('should return a success notification', () => {
      expect(actionHandler.notify(notification.success.content)).toMatchSnapshot()
    })

    it('should return a warning notification', () => {
      expect(actionHandler.notify(notification.warning)).toMatchSnapshot()
    })

    it('should return a error notification', () => {
      expect(actionHandler.notify(notification.error)).toMatchSnapshot()
    })
  })
})
