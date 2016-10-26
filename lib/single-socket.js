const EventEmitter = require('events')
const path = require('path')
const fork = require('child_process').fork
const ipc = require('node-ipc')

class SingleSocket extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.options = options
    this.spawnedServer = false
    this.url = url
    this.ipc = new ipc.IPC
    this.connect()
  }

  connect() {
    this.spawnedServer = false

    this.ipc.connectTo('single-socket', () => {
      this.socket = this.ipc.of['single-socket']

      this.socket.on('error', (err) => {
        if (!this.spawnedServer) {
          this.spawnServer()
        }
      })

      this.socket.on('connect', () => {
        this.socket.emit('ss:connect', this.url)
      })

      this.socket.on('disconnect', () => {
      })

      this.socket.on('ws:message', (msg) => {
        this.emit('message', msg)
      })

      this.socket.on('ws:open', (url) => {
        this.emit('open')
      })

      this.socket.on('ws:error', (err) => {
        this.ipc.disconnect('single-socket')
        this.emit('error', err)
      })

      this.socket.on('ws:close', (url) => {
        delete this.socket
        this.ipc.disconnect('single-socket')
        this.emit('close')
      })
    })
  }

  send(msg) {
    if (this.socket) {
      this.socket.emit('ss:message', {url: this.url, msg: msg})
    }
  }

  close() {
    if (this.socket) {
      this.socket.emit('ss:close', this.url)
    }
  }

  spawnServer() {
    var serverPath = path.join(__dirname, 'server.js')

    if (this.options.spawn) {
      this.options.spawn(serverPath)
    } else {
      fork(serverPath)
    }

    this.spawnedServer = true
  }
}

module.exports = SingleSocket
