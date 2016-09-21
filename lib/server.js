const dnode = require('dnode')
const Websocket = require('ws')

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

    ws.on('open', function() {
      resolve(ws)
    })

    ws.on('error', function(e) {
      console.log('ON ERROR from native websocket!!!')
      console.log(e)
      reject(e)
    })

    ws.on('message', function(data, flags) {
      console.log('msg received from socket for url:: ', url, data)
      console.log(flags)
      clients[url].forEach(function(client) {
        console.log('sending to dnode client::')
        console.log(data)
        client.onmessage ? client.onmessage(data) : null
      })
    })

    ws.on('close', function() {
      console.log('websocket closed for url: ', url)
      console.log(arguments)

      delete sockets[url]

      clients[url].forEach(function(client) {
        client.onclose ? client.onclose() : null
      })
    })

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
        cb({status: 'error', error: err})
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

console.log('dnode server starting on port ' + port)
server.listen(port)
