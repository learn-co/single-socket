const path = require('path')
const fork = require('child_process').fork
const Websocket = require('websocket').w3cwebsocket
const shell = require('shelljs')

before(function(done) {
  var port = 8001

  this.startServer = function() {
    return new Promise(function(resolve, reject) {
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
  var pids = shell.exec('ps aux | grep single-socket/lib/server.js | grep -v grep | awk \'{print $2}\'').stdout.split('\n').join(' ')
  shell.exec('kill ' + pids)
  this.stopServer().then(function() {
    done()
  })
})

require('./single-socket')
