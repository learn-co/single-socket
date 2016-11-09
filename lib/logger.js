const winston = require('winston')
const path = require('path')
const os = require('os')

module.exports = (logFile) => {
  return new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        filename: logFile || path.join(os.homedir(), 'single-socket.log'),
        level: 'info'
      })
    ]
  })
}
