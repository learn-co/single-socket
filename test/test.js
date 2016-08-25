const path = require('path')
const fork = require('child_process').fork
const Websocket = require('websocket').w3cwebsocket

global.log = function log() {
  console.log.bind(console).apply(arguments)
}

before(function(done) {
  var port = 8001

  this.startServer = function() {
    return new Promise(function(resolve, reject) {
      log('starting test websocket server on port ' + port)

      if (!this.wsServer) {
        this.wsServer = fork(path.join(__dirname, 'ws-server.js'), [port])
      }

      connect.call(this)

      function connect() {
        this.testServerWS = new Websocket('ws://localhost:' + port)

        this.testServerWS.onopen = resolve

        this.testServerWS.onerror = function(err) {
          connect()
        }
      }
    })
  }

  this.stopServer = function() {
    return new Promise(function(resolve, reject) {
      if (!this.wsServer) {
        return resolve()
      }

      log('killing test websocket server')

      var self = this

      this.wsServer.on('close', function() {
        self.wsServer = null
        resolve()
      })

      this.wsServer.kill()
    })
  }

  this.startServer().then(function() {
    done()
  })
})

after(function(done) {
  this.stopServer().then(function() {
    done()
  })
})

require('./single-socket')
