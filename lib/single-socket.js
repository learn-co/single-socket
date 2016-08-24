const dnode = require('dnode')
const path = require('path')
const fork = require('child_process').fork

var startedServer = false

function SingleSocket(url, args) {
  args || (args = {})

  args.onopen    || (args.onopen    = function() { })
  args.onerror   || (args.onerror   = function() { })
  args.onclose   || (args.onclose   = function() { })
  args.onmessage || (args.onmessage = function() { })

  var client = dnode({
    onopen: args.onopen,
    onerror: args.onerror,
    onclose: args.onclose,
    onmessage: args.onmessage
  }, {weak: false}).connect(8888)

  client.on('error', function(err) {
    if (!startedServer) {
      fork(path.join(__dirname, 'server.js'))
    }

    startedServer = true
    client.connect(8888)
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
