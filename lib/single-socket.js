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

  close() {
    return new Promise((resolve, reject) => {
      this.remote.close(function() {
        resolve()
      })
    })
  },

  _connectToWSProxy() {
    console.log('dnode client attempting to connect on port ', this.port)
    this.client = dnode(Object.assign({}, this.args), {weak: false}).connect(this.port)

    this.client.on('error', (err) => {
      console.log('error connecting to dnode server')
      if (!this.startedServer) {
        console.log('starting dnode server')
        fork(path.join(__dirname, 'server.js'), [this.port])
      }

      this.startedServer = true

      if (!this.dnodeConnected) {
        setTimeout(() => {
          console.log('reconnecting in timeout')
          this._connectToWSProxy()
        }, 1000)
      }
    })

    this.client.on('remote', (remote) => {
      console.log('connected to dnode remote')
      this.remote = remote
      this.dnodeConnected = true
      console.log('attempting connection for url: ', this.url)
      this.remote.connect(this.url, function(res) {
        if (res.status === 'success') {
          console.log('success connecting!')
        }

        if (res.status === 'error') {
          console.error('errrrooororororororo', res.error)
        }
      })
    })
  }
}

module.exports = SingleSocket
