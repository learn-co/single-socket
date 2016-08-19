const path = require('path')
const fork = require('child_process').fork
const WebSocket = require('ws')

function SingleSocket (url) {
  this.proxyPort = 8000
  this.proxyURL = 'ws://localhost:' + this.proxyPort + '/'
  this.targetURL = url
  this.socket = null
  this.proxyServer = null
  this.creatingProxyServer = false
  this.connect()
}

SingleSocket.prototype = {
  connect() {
    log('attempting to connect to proxy server' + this.proxyURL)

    this.socket = new WebSocket(this.proxyURL)

    this.socket.on('error', (e) => {
      log('connection error...')
      log(e)
      // if (!this.creatingProxyServer) {
        // log('creating proxy server...')
        // this.createProxyServer();
      // }
    })

    this.socket.on('open', (e) => {
      log('client connected')
      this.socketConnected = true
      this.socket.send('requestSingleSocket:' + this.targetURL)
      this.creatingProxyServer = false
    })

    this.socket.on('close', (e) => {
      log('client closed...reconnecting...')
      this.connect()
    })

    this.socket.on('message', (data) => {
      log(data)
    })
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
