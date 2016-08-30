const dnode = require('dnode')
const path = require('path')
const fork = require('child_process').fork
const clone = require('lodash.clone')

function connectToWSProxy(url, args) {
  var singleSocket = this

  connect(url, args)

  function connect(url, args) {
    console.log('port:::', args.port)
    var client = dnode(clone(args), {weak: false}).connect(singleSocket.port)

    client.on('error', function(err) {
      console.log(singleSocket.startedServer)
      console.log(singleSocket.port)
      if (!singleSocket.startedServer) {
        fork(path.join(__dirname, 'server.js'), [singleSocket.port])
      }

      singleSocket.startedServer = true

      setTimeout(function() {
        console.log(args)
        connect.bind(singleSocket)(url, args)
      }, 100)
    })

    client.on('remote', function(remote) {
      remote.connect(url)
    })
  }
}

function SingleSocket(url, args) {
  this.startedServer = false

  args || (args = {})

  var cbFns = ['onopen', 'onerror', 'onclose', 'onmessage']

  cbFns.forEach((method) => {
    args[method] || (args[method] = function() { })
  })

  args.port || (args.port = 8888)

  this.port = args.port

  connectToWSProxy.bind(this)(url, args)
}

module.exports = SingleSocket
