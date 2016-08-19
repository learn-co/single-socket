const dnode = require('dnode')
const Websocket = require('websocket').w3cwebsocket
const _ = require('underscore')

var sockets = {}
var clients = {}

var server = dnode(function(client) {
  var time = Date.now()
  clients[time] = client

  this.connect = function(url, cb) {
    console.log('dnode server: ' + url)

    if (sockets[url]) {
      console.log('found socket in cache')
      var ws = sockets[url]
      // console.log('heres the socket')
      // ws.onopen = function() { client.onopen.apply(arguments) }
      // ws.onerror = function() { client.onerror.apply(arguments) }
      // ws.onclose = function() { client.onclose.apply(arguments) }
      // ws.onmessage = function() { client.onmessage.apply(arguments) }
      //
      setInterval(function() {
        client.onmessage('testing')
      }, 1000)

      cb(true)
    } else {
      console.log('creating new socket')

      var ws = new Websocket(url, 'echo-protocol')
      sockets[url] = ws

      ws.onopen = function() {
        client.onopen.apply(arguments)
      }

      // ws.onmessage = function() {
        // var args = arguments

        // _.each(clients, function(client) {
          // client.onmessage.apply(arguments)
        // })
      // }

      setInterval(function() {
        client.onmessage('testing')
      }, 1000)

      // ws.onerror = function() { client.onerror.apply(arguments) }
      // ws.onclose = function() { client.onclose.apply(arguments) }
      cb(true)
    }
  }
})

server.listen(8000)
