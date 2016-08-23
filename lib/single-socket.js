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
  }).connect(8000)

  client.on('error', function(err) {
    if (!startedServer) {
      console.log('starting server')
      fork(path.join(__dirname, 'server.js'))
    }

    startedServer = true
    client.connect(8000)
  })

  var self = this
  client.on('remote', function(remote) {
    self.remote = remote

    remote.connect(url, function(res) {
      if (res.status === 'success') {
        console.log('connected to remote successfully')
      }
    })
  })
}

SingleSocket.prototype = {
  send: function(msg) {
    console.log('sending msg')
    this.remote.send(msg, function(res) {
      console.log('response from sending msg', res)
    })
  }
}

module.exports = SingleSocket
