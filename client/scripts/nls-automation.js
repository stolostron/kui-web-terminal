/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/

const fs = require('fs')
const path = require('path')

const theme = require('../theme/theme.json')
const nlsDir = path.join(__dirname, '..', 'nls')
const nlsFiles = fs.readdirSync(nlsDir)

nlsFiles.forEach(fileName => {
  const nls = require(`../nls/${fileName}`)
  const { description, gettingStarted } = nls
  let locale = fileName.replace('messages_', '').replace('.json', '')
  locale = locale === 'en' ? 'en_US' : locale

  theme.description[locale] = description
  theme.gettingStarted[locale] = gettingStarted
})

fs.writeFileSync(path.join(__dirname, '..', 'theme', 'theme.json'), JSON.stringify(theme, null, 2))
