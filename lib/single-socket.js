const dnode = require('dnode')

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

  client.on('remote', (remote) => {
    this.remote = remote

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

var socket = new SingleSocket(
  '',
  {
    onopen: function() {
      console.log('open connection')
      socket.send({test: 'hello'})
    },
    onerror: function(e) {
      console.log('error', e)
    },
    onclose: function() {
      console.log('socket closed')
    },
    onmessage: function(msg) {
      console.log('on message', msg)
    }
  }
)
