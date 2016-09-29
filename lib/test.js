const fork = require('child_process').fork

console.log('launching server')
fork(path.join(__dirname, 'server.js'))
