const fork = require('child_process').fork
const path = require('path')

console.log('launching server')
console.log('WU TANGGGGGGGGGGGGGGGGGGGGG')
fork(path.join(__dirname, 'server.js'))
