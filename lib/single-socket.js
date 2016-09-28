const EventEmitter = require('events')
const path = require('path')
const fork = require('child_process').fork
const ipc = require('node-ipc')

class SingleSocket extends EventEmitter {
  constructor(url) {
    super()
    this.url = url
    this.ipc = new ipc.IPC
    this.connect()
  }

  connect() {
    this.ipc.connectTo('single-socket', () => {
      this.socket = this.ipc.of['single-socket']

      this.ipc.of['single-socket'].on('error', (err) => {
        if (err.code === 'ECONNREFUSED') {
          this.forkServer()
        }
      })

      this.ipc.of['single-socket'].on('connect', () => {
        this.ipc.log('connected to single socket server')
        this.ipc.of['single-socket'].emit('ws:connect', this.url)
      })

      this.ipc.of['single-socket'].on('disconnect', () => {
        this.ipc.log('disconnected from single socket server')
      })

      this.ipc.of['single-socket'].on('ws:message', (msg) => {
        this.ipc.log(`received message from single socket server for ${this.url}`, msg)
        this.emit('message', msg)
      })

      this.ipc.of['single-socket'].on('ws:open', (url) => {
        this.ipc.log(`websocket has been opened on single socket server for ${this.url}`)
        this.emit('open')
      })

      this.ipc.of['single-socket'].on('ws:error', (err) => {
        this.ipc.log(`there was an error with the websocket for ${this.url}`)
        this.emit('error', err)
      })

      this.ipc.of['single-socket'].on('ws:close', (url) => {
        this.ipc.log(`websocket has been closed on the single socket server for ${this.url}`)
        delete this.socket
        this.emit('close')
      })
    })
  }

  close() {
    if (this.socket) {
      this.socket.emit('ss:close', this.url)
    }
  }

  forkServer() {
    fork(path.join(__dirname, 'server.js'))
  }
}

module.exports = SingleSocket
