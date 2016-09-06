const dnode = require('dnode')
const path = require('path')
const fork = require('child_process').fork

function SingleSocket(url, args) {
  args || (args = {})
  this.dnodeConnected = false
  this.port = args.port || 8888

  this.startedServer = false

  var callbacks = ['onopen', 'onerror', 'onclose', 'onmessage']

  callbacks.forEach((method) => {
    args[method] || (args[method] = function() { })
  })

  this.url = url

  this._connectToWSProxy(args)
}

SingleSocket.prototype = {
  send(data) {
    if (this.remote) {
      this.remote.send(this.url, data)
    }
  },

  _connectToWSProxy(args) {
    this.client = dnode(args, {weak: false}).connect(this.port)

    this.client.on('error', (err) => {
      if (!this.startedServer) {
        fork(path.join(__dirname, 'server.js'), [this.port])
      }

      startedServer = true

      if (!this.dnodeConnected) {
        setTimeout(() => {
          this._connectToWSProxy(this.url, args)
        }, 1000)
      }
    })

    this.client.on('remote', (remote) => {
      this.remote = remote
      this.dnodeConnected = true
      this.remote.connect(this.url)
    })
  }
}

module.exports = SingleSocket
