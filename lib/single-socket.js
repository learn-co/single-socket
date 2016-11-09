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
    if (this.options.silent) {
      this.ipc.config.silent = true
    }
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
        var args = {url: this.url, logFile: this.options.logFile}
        this.socket.emit('ss:connect', args)
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
    return new Promise((resolve, reject) => {
      var client = this.ipc.of['single-socket']
      if (client) {
        client.off('*', '*')
        client.on('ws:error', resolve)
        client.on('ws:close', resolve)
        client.emit('ss:close', this.url)
      }
      resolve()
    })
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
