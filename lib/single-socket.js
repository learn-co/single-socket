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

  this._connectToWSProxy(url, args)
}

SingleSocket.prototype = {
  _connectToWSProxy(url, args) {
    var client = dnode(args, {weak: false}).connect(this.port)

    client.on('error', (err) => {
      if (!this.startedServer) {
        fork(path.join(__dirname, 'server.js'), [this.port])
      }

      startedServer = true

      if (!this.dnodeConnected) {
        setTimeout(() => {
          this._connectToWSProxy(url, args)
        }, 1000)
      }
    })

    client.on('remote', (remote) => {
      this.dnodeConnected = true
      remote.connect(url)
    })
  }
}

module.exports = SingleSocket
