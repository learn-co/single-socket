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

  this.args = args

  this.url = url

  this._connectToWSProxy(args)
}

SingleSocket.prototype = {
  send(data) {
    if (this.remote) {
      this.remote.send(this.url, data)
    }
  },

  _connectToWSProxy() {
    this.client = dnode(Object.assign({}, this.args), {weak: false}).connect(this.port)

    this.client.on('error', (err) => {
      console.log('error connecting to dnode server')
      if (!this.startedServer) {
        console.log('starting dnode server')
        fork(path.join(__dirname, 'server.js'), [this.port])
      }

      startedServer = true

      if (!this.dnodeConnected) {
        setTimeout(() => {
          console.log('reconnecting in timeout')
          this._connectToWSProxy(this.url)
        }, 1000)
      }
    })

    this.client.on('remote', (remote) => {
      console.log('connected to dnode remote')
      this.remote = remote
      this.dnodeConnected = true
      this.remote.connect(this.url)
    })
  }
}

module.exports = SingleSocket
