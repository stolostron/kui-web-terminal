const fs = require('fs')
const path = require('path')

const clientPath = path.join(__dirname, '..', 'client', 'package.json')
const proxyPath = path.join(__dirname, '..', 'proxy', 'package.json')
const clientLockPath = path.join(__dirname, '..', 'client', 'package-lock.json')
const proxyLockPath = path.join(__dirname, '..', 'proxy', 'package-lock.json')

const client = require(clientPath) 
const proxy = require(proxyPath)
const clientLock = require(clientLockPath)
const proxyLock = require(proxyLockPath)

const ossc = Object.assign({}, proxy)
ossc.dependencies = Object.assign({}, client.dependencies, proxy.dependencies)
delete ossc.devDependencies

const osscLock = Object.assign({}, proxyLock)
osscLock.dependencies = Object.assign({}, proxyLock.dependencies, clientLock.dependencies)

const awsomDir = path.join(__dirname, '..', 'awsom-output', 'package.json')
const awsomDirLock = path.join(__dirname, '..', 'awsom-output', 'package-lock.json')

fs.writeFileSync(awsomDir, JSON.stringify(ossc, null, 2))
fs.writeFileSync(awsomDirLock, JSON.stringify(osscLock, null, 2))
