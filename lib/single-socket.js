const dnode = require('dnode')

var client = dnode({
  onopen: function() {
    console.log('open connection')
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
}).connect(8000)

client.on('remote', function(remote) {
  var url = ''
  remote.connect(url, function(ws) {
    console.log('client received: ', ws)
  })
})

module.exports = client
