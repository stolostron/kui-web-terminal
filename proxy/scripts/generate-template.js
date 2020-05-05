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
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const htmlPath = path.join(__dirname, '..', '..', 'client', 'dist', 'webpack', 'kui', 'index.html')
const kuiHtml = fs.readFileSync(htmlPath, 'utf8')
const kuiDom = new JSDOM(kuiHtml)
const { document } = kuiDom.window

const headElement = document.querySelector('head')
const bodyElement = document.querySelector('body')

const noncePlaceHolder = '{kuiNonce}' 
const nonceReplace = 'kuiDefaultNonce' // all nonce set to this string will be replaced 

// Header Elements ================================
const headerContainer = document.createElement('div')
headerContainer.id = 'header'
headerContainer.innerHTML = '{header|s}'
bodyElement.insertBefore(headerContainer, bodyElement.childNodes[0])

const headerCss = document.createElement('link')
headerCss.setAttribute('rel', 'stylesheet')
headerCss.setAttribute('href', '{filesH.css.path}')

headerCss.setAttribute('nonce',noncePlaceHolder)
headElement.prepend(headerCss)


const stateScript = document.createElement('script')
stateScript.setAttribute('charset', 'UTF-8')
stateScript.setAttribute('nonce', noncePlaceHolder)
stateScript.innerHTML = 'window.__PRELOADED_STATE__= {stateH|js|s}'
bodyElement.appendChild(stateScript)

const propsScript = document.createElement('script')
propsScript.id = 'props'
propsScript.setAttribute('type', 'application/json')
propsScript.setAttribute('nonce', noncePlaceHolder)
propsScript.innerHTML = '{propsH|js|s}'
bodyElement.appendChild(propsScript)

const nlsScript = document.createElement('script')
nlsScript.setAttribute('src', '{filesH.nls.path}')
nlsScript.setAttribute('nonce', noncePlaceHolder)
bodyElement.appendChild(nlsScript)

const dllScript = document.createElement('script')
dllScript.setAttribute('src', '{filesH.dll.path}')
dllScript.setAttribute('nonce', noncePlaceHolder)
bodyElement.appendChild(dllScript)

const jsScript = document.createElement('script')
jsScript.setAttribute('src', '{filesH.js.path}')
jsScript.setAttribute('nonce', noncePlaceHolder)
bodyElement.appendChild(jsScript)
// ==================================================

// Inject our custom css styling
const mcmKuiLink = document.createElement('link')
mcmKuiLink.rel = 'stylesheet'
mcmKuiLink.href = '/kui/mcm-kui.css'

headElement.appendChild(mcmKuiLink)

// Get all scripts and links
const scripts = Array.from(document.querySelectorAll('script'))
const links = Array.from(document.querySelectorAll('link'))

// Fix inline webpack script
const inlineWebpackScript = scripts.find(script => script.innerHTML.includes('window[\'_kuiWebpackResourceRoot\']') )
inlineWebpackScript.innerHTML = inlineWebpackScript.innerHTML.replace('window[\'_kuiWebpackResourceRoot\']',';window[\'_kuiWebpackResourceRoot\']')
inlineWebpackScript.innerHTML = inlineWebpackScript.innerHTML.replace('window[\'_kuiWebpackHash\']', ';window[\'_kuiWebpackHash\']')

// Fix nonce
//iterate through scripts/links, and replace nonce with variable
const nonceScripts = scripts.filter(script => script.nonce === nonceReplace)
for(let script of nonceScripts){
  script.nonce = noncePlaceHolder
}

const nonceLinks = links.filter(link => link.nonce === nonceReplace)
for(let link of nonceLinks){
  link.nonce = noncePlaceHolder
}

const staticAssetsPath = path.join(__dirname, '..', 'app', 'public')

// CSS hack for search
//const searchCssPath = path.join(__dirname, '..', '..', 'client', 'node_modules', '@kui-shell', 'plugin-search', 'mdist', 'src-web', 'styles', 'index.css')
//fs.copyFileSync(searchCssPath, staticAssetsPath + '/plugin-search.css')

// CSS hack for plugin-carbon-themes css files
/*const carbonPluginCssPath = path.join(__dirname, '..', '..', 'client', 'node_modules', '@kui-shell', 'plugin-carbon-themes', 'web', 'css')
const stripeName = 'top-tab-stripe-alt.css'
const stripePath = path.join(carbonPluginCssPath, stripeName)
const plexName = 'ibm-plex.css'
const plexPath = path.join(carbonPluginCssPath, plexName)
fs.copyFileSync(stripePath, `${staticAssetsPath}/${stripeName}`)
fs.copyFileSync(plexPath, `${staticAssetsPath}/${plexName}`)*/

const domOutput = document.documentElement.innerHTML
const viewsPath = path.join(__dirname, '..', 'app', 'views')
const templateName = 'main.dust'
const dustTemplate = `${viewsPath}/${templateName}`

const copyright = `{!
  * Licensed Materials - Property of IBM
  * (c) Copyright IBM Corporation 2019. All Rights Reserved.
  *
  * Note to U.S. Government Users Restricted Rights:
  * Use, duplication or disclosure restricted by GSA ADP Schedule
  * Contract with IBM Corp.
 !}
`

fs.writeFileSync(dustTemplate, `${copyright}<!DOCTYPE html><html lang={lang}>${domOutput}</html>`)
