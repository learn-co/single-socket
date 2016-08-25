const dnode = require('dnode')
const path = require('path')
const fork = require('child_process').fork

function SingleSocket(url, args) {
  args || (args = {})
  var startedServer = false

  var API = ['onopen', 'onerror', 'onclose', 'onmessage']

  // set default empty fn
  API.forEach((method) => {
    args[method] || (args[method] = function() { })
  })

  var client = dnode(args, {weak: false}).connect(8888)

  client.on('error', function(err) {
    if (!startedServer) {
      fork(path.join(__dirname, 'server.js'))
    }

    startedServer = true

    setTimeout(function() {
      client.connect(8888)
    }, 100)
  })

  var self = this
  client.on('remote', function(remote) {
    self.remote = remote

    remote.connect(url, function(res) {
    })
  })
}

SingleSocket.prototype = {
  send: function(msg) {
    this.remote.send(msg)
  }
}

module.exports = SingleSocket
