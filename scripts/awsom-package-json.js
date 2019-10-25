const fs = require('fs')
const path = require('path')

const clientPath = path.join(__dirname, '..', 'client', 'package.json')
const proxyPath = path.join(__dirname, '..', 'proxy', 'package.json')
const client = require(clientPath) 
const proxy = require(proxyPath)

const ossc = Object.assign({}, proxy)
ossc.dependencies = Object.assign({}, client.dependencies, proxy.dependencies)
delete ossc.devDependencies

const awsomDir = path.join(__dirname, '..', 'awsom-output', 'package.json')
fs.writeFileSync(awsomDir, JSON.stringify(ossc))
