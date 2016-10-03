const path = require('path')
const spawn = require('child_process').spawn

spawn('node', [path.join(__dirname, 'server.js')])
