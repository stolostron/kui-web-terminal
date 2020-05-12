/*******************************************************************************
* Licensed Materials - Property of IBM
* (c) Copyright IBM Corporation 2019. All Rights Reserved.
*
* Note to U.S. Government Users Restricted Rights:
* Use, duplication or disclosure restricted by GSA ADP Schedule
* Contract with IBM Corp.
*******************************************************************************/
'use strict'
const i18n = require('../../../dist/src-web/util/i18n')

describe('i18n', () => {
  const strings = {
    "search.label" : "Search",
    "search.label.links" : "Search [+Search]",
    "search.label.logs" : "Logs",
    "search.label.related" : "Related Resources",
    "search.label.summary" : "Summary",
    "search.label.query" : "Related resources for search results: {0}",
    "search.label.view.related" : "View Related Resources",
    "search.loading" : "Loading results",
    "search.noresults" : "No search results found.",
    "search.no.resources.found" : "No resources found.",
    "search.notfound" : "No logs found",
    "search.placeholder" : "Search items",
    "search.tile.results" : "Results",
  }

  it('should localize the string in the correct language', () => {
    Object.entries(strings).forEach(string => {
      expect(i18n.default(string[0])).toBe(string[1])
      expect(i18n.default(string[0])).not.toBe(string[0])
      expect(i18n.default(string[0])).toMatchSnapshot()
    })
  })
})
