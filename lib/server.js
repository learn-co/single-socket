const dnode = require('dnode')
const Websocket = require('websocket').w3cwebsocket
const _ = require('underscore')

var sockets = {}
var clients = {}

function getSocket(url) {
  return new Promise(function(resolve, reject) {
    var cachedSocket = sockets[url]

    if (cachedSocket) {
      resolve(cachedSocket)
      return
    }

    var ws = new Websocket(url, 'echo-protocol')

    ws.onopen = function() {
      resolve(ws)
    }

    ws.onerror = function(e) {
      reject(e)
    }

    ws.onmessage = function() {
      var args = arguments

      clients[url].forEach(function(client) {
        client.onmessage.apply(args)
      })
    }
  })
}

var server = dnode(function(client) {
  var time = Date.now()
  clients[time] = client

  this.send = function(msg, cb) {
    msg.received = true
    cb(msg)
  }

  this.connect = function(url, cb) {
    console.log('dnode server: ' + url)
    clients[url] || (clients[url] = [])
    clients[url].push(client)
    console.log('clients for ' + url, clients[url].length, clients[url])

    getSocket(url).then(function(socket) {
      console.log('getting socket')
      client.onopen()
      cb({status: 'success'})
    }).catch(function(err) {
      console.log(err)
      client.onerror(err)
      cb({status: 'error'})
    })
  }
})

server.listen(8000)
