const path = require('path')
const fork = require('child_process').fork

fork(path.join(__dirname, 'server.js'))
