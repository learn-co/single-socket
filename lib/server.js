const dnode = require('dnode')
const Websocket = require('websocket').w3cwebsocket

var port = process.argv[2]
var sockets = {}
var clients = {}

function getSocket(url) {
  return new Promise(function(resolve, reject) {
    var cachedSocket = sockets[url]

    if (cachedSocket) {
      console.log('found cached socket for ', url)
      resolve(cachedSocket)
      return
    }

    console.log('creating websocket for ', url)
    var ws = new Websocket(url, 'echo-protocol')

    ws.onopen = function() {
      resolve(ws)
    }

    ws.onerror = function(e) {
      reject(e)
    }

    ws.onmessage = function(msg) {
      console.log('msg received from socket for url:: ', url, msg.data)
      clients[url].forEach(function(client) {
        console.log('sending to dnode client::')
        console.log(msg.data)
        client.onmessage ? client.onmessage(msg.data) : null
      })
    }

    ws.onclose = function() {
      delete sockets[url]

      clients[url].forEach(function(client) {
        client.onclose ? client.onclose() : null
      })
    }

    sockets[url] = ws
  })
}

var server = dnode(function(client) {
  this.send = function(url, data, cb) {
    getSocket(url).then(function(socket) {
      console.log({data: data})
      socket.send(data)

      if (cb) {
        cb(data)
      }
    })
  }

  this.connect = function(url, cb) {
    console.log('connecting dnode client to url: ', url)
    clients[url] || (clients[url] = [])
    clients[url].push(client)
    client._url = url

    getSocket(url).then(function(socket) {
      console.log('grabbed socket')
      console.log('onopen callback')
      console.log(client.onopen)
      client.onopen ? client.onopen() : null

      if (cb) {
        cb({status: 'success'})
      }
    }).catch(function(err) {
      client.onerror ? client.onerror(err) : null

      if (cb) {
        cb({status: 'error'})
      }
    })
  }

  this.close = function(cb) {
    console.log('clients for client w url:', client._url)

    var subscribedClients = clients[client._url]
    console.log(subscribedClients)

    clients[client._url] = subscribedClients.filter(function(c) {
      c !== client
    })

    console.log('clients after filter')
    console.log(clients[client._url])

    console.log('sockets')
    console.log(sockets)

    if (!clients[client._url].length) {
      console.log('no more clients on socket...closing')
      console.log(sockets)

      var socket = sockets[client._url]

      if (socket) {
        socket.close()
      }

      delete sockets[client._url]
      console.log(sockets)
    }

    cb()
  }
}, {weak: false})

server.listen(port)
