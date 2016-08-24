const path = require('path')
const fork = require('child_process').fork

global.log = function log() {
  console.log.apply(arguments)
}

before(function(done) {
  var port = 8001

  this.startServer = function() {
    log('starting test websocket server on port ' + port)
    if (!this.wsServer) {
      this.wsServer = fork(path.join(__dirname, 'ws-server.js'), [port])
    }
  }

  this.stopServer = function() {
    log('killing test websocket server')
    if (this.wsServer) {
      this.wsServer.kill()
      this.wsServer = null
    }
  }

  this.startServer()

  setTimeout(done, 1500)
})

after(function() {
  this.stopServer()
})

require('./single-socket')
