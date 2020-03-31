/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

// To make testing easier, we will clear command output and always check the first output
const activeTabSelector = 'tab.visible'
const outputSelector = activeTabSelector + ' .repl-block[data-input-count="0"]'
const successSelector = outputSelector + '.valid-response'
const resultInputSelector =  outputSelector + ' .repl-input-element'

const failureSelector = outputSelector + '.error'
const failureOutputSelector = failureSelector + ' .oops pre'

module.exports = { outputSelector, successSelector, resultInputSelector, failureSelector, failureOutputSelector }