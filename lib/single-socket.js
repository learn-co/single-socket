const path = require('path')
const fork = require('child_process').fork
const WebSocket = require('websocket').w3cwebsocket

function SingleSocket (url) {
  this.target = url
  this.proxy = 'ws://localhost:8000'


  this.connectToProxy()

  return this.socket
}

SingleSocket.prototype = {
  spawningServer: false,

  serverProcess: null,

  connectToProxy() {
    console.log('attempting to connect to proxy server: ' + this.proxy)

    this.socket = new WebSocket(this.proxy, 'echo-protocol')

    this.socket.onerror = (e) => {
      console.log('Error connecting to proxy server...')

      if (!this.spawningServer) {
        console.log('Spawning new proxy server...')
        this.spawnServer();
      }
    }

    this.socket.onopen = (e) => {
      console.log('WebSocket Client Connected')
      this.socketConnected = true
      this.socket.send('hello world')
      this.spawningServer = false
    }

    this.socket.onclose = (e) => {
      console.log('client closed')
      console.log('reconnecting...')
      this.connectToProxy()
    }

    this.socket.onmessage = (e) => {
      console.log('received msg')
      if (typeof e.data === 'string') {
        console.log("Received: '" + e.data + "'")
      }
    }
  },

  spawnServer() {
    this.spawningServer = true
    this.serverProcess = fork(path.join(__dirname, 'server.js'))
    this.serverProcess.on('message', function(m) {
      console.log('received: ', m)
    })
    this.serverProcess.on('error', function(e) {
      console.log('child process error', e)
    })
  },

  cleanup() {
    if (this.serverProcess) {
      this.serverProcess.kill()
    }
  }
}

module.exports = SingleSocket
