const http = require('http')
const WebSocketServer = require('ws').Server

var port = process.argv[2]

var wsServer = new WebSocketServer({ port: port })

wsServer.on('connection', function(ws) {
  ws.on('message', function(msg) {
    if (msg === 'ping') {
      ws.send('pong')
    }
  })
})
