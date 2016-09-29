const fork = require('child_process').fork
const path = require('path')

console.log('launching server')
fork(path.join(__dirname, 'server.js'))
