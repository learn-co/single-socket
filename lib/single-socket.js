const dnode = require('dnode')
const path = require('path')
const fork = require('child_process').fork

var startedServer = false

function connectToWSProxy(url, args) {
  var client = dnode(args, {weak: false}).connect(8888)

  client.on('error', function(err) {
    if (!startedServer) {
      fork(path.join(__dirname, 'server.js'))
    }

    startedServer = true

    setTimeout(function() {
      connectToWSProxy(url, args)
    }, 100)
  })

  client.on('remote', function(remote) {
    remote.connect(url)
  })
}

function SingleSocket(url, args) {
  args || (args = {})

  var API = ['onopen', 'onerror', 'onclose', 'onmessage']

  API.forEach((method) => {
    args[method] || (args[method] = function() { })
  })

  connectToWSProxy(url, args)
}

module.exports = SingleSocket
