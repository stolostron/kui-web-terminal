/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict'

const chalk = require('chalk')

exports.assertion = function(command) {
  this.message = `Testing if executed command is: ${chalk.bold.cyan(command)}`
  this.expected = command
  this.pass = value => value === this.expected
  this.failed = result => !result.value
  this.value = result => result.value

  this.command = function(callback) {
    // eslint-disable-next-line prefer-arrow-callback
    this.api.execute(function(command) {
      return document.querySelector('tab.visible .repl-block[data-input-count="0"] .repl-input-element').value
    }, [command], callback)
  }
}