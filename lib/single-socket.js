const path = require('path')
const fork = require('child_process').fork
const WebSocket = require('websocket').w3cwebsocket

function SingleSocket (url) {
  this.proxyPort = 8000
  this.proxyURL = 'ws://localhost:' + this.proxyPort
  this.targetURL = url
  this.socket = null
  this.proxyServer = null
  this.creatingProxyServer = false
  this.connect()
}

SingleSocket.prototype = {
  connect() {
    log('attempting to connect to proxy server' + this.proxyURL)

    this.socket = new WebSocket(this.proxyURL, 'echo-protocol')

    this.socket.onerror = (e) => {
      log('connection error...')
      if (!this.creatingProxyServer) {
        log('creating proxy server...')
        this.createProxyServer();
      }
    }

    this.socket.onopen = (e) => {
      log('client connected')
      this.socketConnected = true
      this.socket.send('requestSingleSocket:' + this.targetURL)
      this.creatingProxyServer = false
    }

    this.socket.onclose = (e) => {
      log('client closed...reconnecting...')
      this.connect()
    }

    this.socket.onmessage = (e) => {
      if (typeof e.data === 'string') {
        log('proxy client received: ' + e.data)
      }
    }
  },

  createProxyServer() {
    this.creatingProxyServer = true
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
