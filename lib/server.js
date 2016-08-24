const dnode = require('dnode')
const Websocket = require('websocket').w3cwebsocket

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

    ws.onmessage = function(msg) {
      clients[url].forEach(function(client) {
        client.onmessage ? client.onmessage(msg.data) : null
      })
    }
  })
}

var server = dnode(function(client) {
  this.send = function(msg, cb) {
    msg.received = true
    cb(msg)
  }

  this.connect = function(url, cb) {
    clients[url] || (clients[url] = [])
    clients[url].push(client)

    getSocket(url).then(function(socket) {
      client.onopen ? client.onopen() : null
      cb({status: 'success'})
    }).catch(function(err) {
      client.onerror ? client.onerror(err) : null
      cb({status: 'error'})
    })
  }
})

server.listen(8000)
