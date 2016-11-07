const winston = require('winston')
const path = require('path')
const os = require('os')

var logfile = path.join(os.homedir(), 'single-socket.log')

logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      filename: logfile,
      level: 'info'
    })
  ]
})

module.exports = logger
