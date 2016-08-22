const dnode = require('dnode')

function SingleSocket(url) {
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
    remote.connect(url, function(ws) {
      console.log('client received: ', ws)
    })
  })
}

new SingleSocket('')

module.exports = SingleSocket
