// /*******************************************************************************
//  * Licensed Materials - Property of IBM
//  * (c) Copyright IBM Corporation 2019. All Rights Reserved.
//  *
//  * Note to U.S. Government Users Restricted Rights:
//  * Use, duplication or disclosure restricted by GSA ADP Schedule
//  * Contract with IBM Corp.
//  *******************************************************************************/

// const AAT = require('@ibma/aat')
// const lodash = require('lodash')
// const chalk = require('chalk')

// /* eslint-disable no-console*/

// module.exports = {
//   runAccessibilityScan: (browser, name) => {
//     browser.source(source => {
//       browser.perform((done) => {

//         AAT.getCompliance(source.value, name, (report) => {
//           // browser.assert.equal(report.summary.counts.violation, 0, `Check for accesibility violations for: ${name}   See report at: ./tests-output/a11y/${name}.json`)
//           if(report.issueMessages.messages && report.summary.counts.violation > 0) {
//             const { messages } = report.issueMessages
//             const issues = lodash.get(report, 'reports[0].issues', [])
//             const violations = issues.filter(issue => issue.level === 'violation')
//             console.log(chalk.red(`----- ${name.toUpperCase()} - ITEMIZED A11Y VIOLATIONS (${report.summary.counts.violation}): --------------------------------------`))
//             violations.forEach((violation, i) => {
//               const args = lodash.flattenDeep(Array.from(violation.msgArgs))
//               let message = messages[violation.messageCode]
//               args.length > 0 && args.forEach((msg, i) => message = message.replace(`{${i}}`, `"${msg}"`))
//               console.log(chalk.red(i + 1 + '.', message))
//               console.log('    ' + violation.snippet)
//               i !== violations.length - 1 && console.log('   ')
//             })
//             console.log(chalk.red('--------------------------------------------------------------------------'))
//           } else {
//             console.log(chalk.bold.green('Accessibility scan passed for: ' + name))
//           }
//           done()
//         })
//       })
//     })
//   }
// }
