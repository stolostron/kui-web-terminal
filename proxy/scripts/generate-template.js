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

const htmlPath = path.join(__dirname, '..', '..', 'client', 'dist', 'webpack', 'index.html')
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

// Fix path to KUI main.js file
const scripts = Array.from(document.querySelectorAll('script'))
const mainScript = scripts.find(script => script.src.startsWith('main') && script.src.endsWith('bundle.js'))
mainScript.src = '/kui/' + mainScript.src

// Fix icon path
const links = Array.from(document.querySelectorAll('link'))
const iconLink = links.find(link => link.href.endsWith('kui.ico'))
if(iconLink){
  iconLink.href = '/kui/' + iconLink.href
}

// Fix inline webpack script
const inlineWebpackScript = scripts.find(script => script.innerHTML.includes('window[\'_kuiWebpackResourceRoot\']') )
inlineWebpackScript.innerHTML = inlineWebpackScript.innerHTML.replace('window[\'_kuiWebpackResourceRoot\']',';window[\'_kuiWebpackResourceRoot\']')
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

// CSS hack for search
const searchCssPath = path.join(__dirname, '..', '..', 'client', 'node_modules', '@kui-shell', 'plugin-search', 'src-web', 'styles', 'index.css')
const staticAssetsPath = path.join(__dirname, '..', 'app', 'public')
fs.copyFileSync(searchCssPath, staticAssetsPath + '/plugin-search.css')

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

fs.writeFileSync(dustTemplate, `${copyright}<!DOCTYPE html><html>${domOutput}</html>`)
