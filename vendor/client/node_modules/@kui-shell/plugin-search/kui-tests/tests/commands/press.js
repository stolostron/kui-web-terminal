/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

'use strict'

const util = require('util')
const events = require('events')

function press () {
  events.EventEmitter.call(this)
}

util.inherits(press, events.EventEmitter)

press.prototype.command = function (selector) {
  this.client.api.execute(function (selector) {
    const click = new MouseEvent('click', { 'bubbles': true, 'cancelable': true });
    const element = document.querySelector(selector);
    element.dispatchEvent(click);
  }, [selector], () => this.emit('complete'))

  return this
}

module.exports = press
