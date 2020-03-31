/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const search = require('../../../dist/src-web/controller/search')
const pluginState = require('../../../dist/pluginState')

const args = {
  argv: ['search', 'kind:pod', 'name:logging-elk-filebeat-ds-62jxh'],
  command: ['search kind:pod name:logging-elk-filebeat-ds-62jxh']
}
const filters = ['cluster', 'kind', 'label', 'name', 'namespace', 'status', 'apiVersion', 'available', 'created']

describe('Search plugin state', () => {
  const spy = jest.spyOn(pluginState, 'getPluginState')
  const _ = pluginState.getPluginState()

  expect(spy).toBeCalled()

  it('should get the plugin state', () => {
    expect(pluginState.getPluginState()).toMatchSnapshot()
  })

  it('should set the plugin state to true', () => {
    pluginState.setPluginState('enabled', true)
    expect(pluginState.getPluginState().enabled).toBe(true)
    expect(pluginState.getPluginState().enabled).toMatchSnapshot()
  })

  it('should set the plugin state to false', () => {
    pluginState.setPluginState('enabled', false)
    expect(pluginState.getPluginState().enabled).toBe(false)
    expect(pluginState.getPluginState().enabled).toMatchSnapshot()
  })

  it('should return a default array of filter values', () => {
    expect(pluginState.getPluginState().default).toMatchSnapshot()
  })

  it('should set the searchSchema filter values', () => {
    pluginState.setPluginState('searchSchema', filters)
    expect(pluginState.getPluginState().searchSchema.length).not.toBe(0)
    expect(pluginState.getPluginState().searchSchema).toMatchSnapshot()
  })

  it('should set the error value', () => {
    pluginState.setPluginState('error', 'Error: Connection timeout')
    expect(pluginState.getPluginState().error).toMatchSnapshot()
  })

  it('should get an updated plugin state', () => {
    expect(pluginState.getPluginState()).toMatchSnapshot()
  })
})

describe('Is search available', () => {
  const spy = jest.spyOn(search, 'isSearchAvailable')
  const _ = search.isSearchAvailable()

  expect(spy).toBeCalled()

  it('should return if search is available', () => {
    expect(search.isSearchAvailable()).toMatchSnapshot()
  })
})

describe('Rendering search available', () => {
  const spy = jest.spyOn(search, 'renderSearchAvailable')
  const _  = search.renderSearchAvailable(true, undefined)

  expect(spy).toBeCalled()

  it('should render that search is installed', () => {
    pluginState.setPluginState('enabled', true)
    pluginState.setPluginState('error', undefined)
    expect(search.renderSearchAvailable(pluginState.getPluginState().enabled, pluginState.getPluginState().error)).toMatchSnapshot()
  })

  it('should render that search is installed, but is not available', () => {
    pluginState.setPluginState('enabled', true)
    pluginState.setPluginState('error', 'Error: Connection timeout')
    expect(search.renderSearchAvailable(pluginState.getPluginState().enabled, pluginState.getPluginState().error)).toMatchSnapshot()
  })

  it('should render that search is not installed', () => {
    pluginState.setPluginState('enabled', false)
    pluginState.setPluginState('error', undefined)
    expect(search.renderSearchAvailable(pluginState.getPluginState().enabled, pluginState.getPluginState().error)).toMatchSnapshot()
  })

  it('should render that there was an issue checking if search was installed', () => {
    pluginState.setPluginState('enabled', false)
    pluginState.setPluginState('error', 'Error: Connection timeout')
    expect(search.renderSearchAvailable(pluginState.getPluginState().enabled, pluginState.getPluginState().error)).toMatchSnapshot()
  })
})

describe('Search command', () => {
  const spy = jest.spyOn(search, 'doSearch')
  const _ = search.doSearch(args)

  expect(spy).toBeCalled()

  it('should call doSearch', () => {
    expect(search.doSearch(args)).toMatchSnapshot()
    expect(search.doSearch).toMatchSnapshot()
  })
})
