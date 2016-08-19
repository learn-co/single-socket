const path = require('path')
const fork = require('child_process').fork
const WebSocket = require('websocket').w3cwebsocket

function SingleSocket (url) {
  this.proxyPort = 8000
  this.proxyURL = 'ws://localhost:' + this.proxyPort
  this.targetURL = url
  this.socket = null
  this.proxyServer = null
  this.creatingServer = false
  this.connect()
}

SingleSocket.prototype = {
  connect() {
    log('attempting to connect to proxy server' + this.proxyURL)

    this.socket = new WebSocket(this.proxyURL, 'echo-protocol')

    this.socket.onerror = (e) => {
      log('connection error...')
      if (!this.creatingServer) {
        log('creating proxy server...')
        this.createServer();
      }
    }

    this.socket.onopen = (e) => {
      log('client connected')
      this.socketConnected = true
      this.socket.send('hello world')
      this.creatingServer = false
    }

    this.socket.onclose = (e) => {
      log('client closed...reconnecting...')
      this.connect()
    }

    this.socket.onmessage = (e) => {
      if (typeof e.data === 'string') {
        log("Received: '" + e.data + "'")
      }
    }
  },

  createServer() {
    this.creatingServer = true
    this.proxyServer = fork(path.join(__dirname, 'server.js'))
    this.proxyServer.on('error', function(err) {
      log('error creating proxy server')
      throw err
    })
  }
}

module.exports = SingleSocket

function log(msg) {
  console.log(msg)
}
