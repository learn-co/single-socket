const dnode = require('dnode')
const Websocket = require('websocket').w3cwebsocket

var sockets = {}
var clients = {}

var port = process.argv[2] || 8888
console.log('port on server')
console.log(port)

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

    ws.onclose = function() {
      clients[url].forEach(function(client) {
        client.onclose ? client.onclose() : null
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
}, {weak: false})

server.listen(port)
