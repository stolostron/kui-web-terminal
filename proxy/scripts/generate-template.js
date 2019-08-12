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

// Header Elements ================================
const headerContainer = document.createElement('div')
headerContainer.id = 'header'
headerContainer.innerHTML = '{header|s}'
bodyElement.insertBefore(headerContainer, bodyElement.childNodes[0])

const headerCss = document.createElement('link')
headerCss.setAttribute('rel', 'stylesheet')
headerCss.setAttribute('href', '{filesH.css.path}')
headElement.appendChild(headerCss)

const stateScript = document.createElement('script')
stateScript.setAttribute('charset', 'UTF-8')
stateScript.innerHTML = 'window.__PRELOADED_STATE__= {stateH|js|s}'
bodyElement.appendChild(stateScript)

const propsScript = document.createElement('script')
propsScript.id = 'props'
propsScript.setAttribute('type', 'application/json')
propsScript.innerHTML = '{propsH|js|s}'
bodyElement.appendChild(propsScript)

const nlsScript = document.createElement('script')
nlsScript.setAttribute('src', '{filesH.nls.path}')
bodyElement.appendChild(nlsScript)

const dllScript = document.createElement('script')
dllScript.setAttribute('src', '{filesH.dll.path}')
bodyElement.appendChild(dllScript)

const jsScript = document.createElement('script')
jsScript.setAttribute('src', '{filesH.js.path}')
bodyElement.appendChild(jsScript)
// ==================================================

// Fix styling in header
const headerStyles = document.createElement('style')
headerStyles.innerHTML = `
  #header #resource-modal .bx--modal-header {
    width: 100%
  }
  #header #resource-modal .bx--modal-footer {
    width: 100%
  }
  #header #resource-modal .bx--modal-footer button.bx--btn {
    padding-top: 0;
    padding-bottom: 0;
  }
  #header .bx--modal-close__icon {
    height: 10px;
    width: 10px;
  }
  #header .bx--modal-content {
    padding-left: 0;
  }
  #header #resource-modal .bx--modal-content {
    padding-left: 5%;
  }
  #header .bx--modal-footer .bx--btn {

  }
  #header .bx--modal-footer {
    height: 105px;
  }
  #header button.bx--btn {
    width: 80px;
    max-width: 80px;
    margin-left: 24px;
    height: 40px;
  }
  #header .bx--modal-content {
    width: 100%;
  }
  #header #brace-editor {
    width: 100vw;
  }
  #header #configure-client-modal .bx--modal-header {
    padding-left: 0;
  }
`
bodyElement.appendChild(headerStyles)

// KUI style overrides
const kuiStyles = document.createElement('style')
kuiStyles.innerHTML = `
  .page {
    height: calc(100% - 3.082rem)
  }
`
bodyElement.append(kuiStyles)

// Fix path to KUI main.js file
const scripts = Array.from(document.querySelectorAll('script'))
const mainScript = scripts.find(script => script.src.startsWith('main') && script.src.endsWith('bundle.js'))
mainScript.src = '/kui/' + mainScript.src

// Fix icon path
const links = Array.from(document.querySelectorAll('link'))
const iconLink = links.find(link => link.href.endsWith('kui.ico'))
iconLink.href = '/kui/' + iconLink.href

const domOutput = document.documentElement.innerHTML
const viewsPath = path.join(__dirname, '..', 'app', 'views')
const templateName = 'main.dust'
const dustTemplate = `${viewsPath}/${templateName}`

fs.writeFileSync(dustTemplate, `<!DOCTYPE html><html>${domOutput}</html>`)
