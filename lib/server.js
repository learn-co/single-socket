const WebSocket = require('websocket').w3cwebsocket
const WebSocketServer = require('websocket').server
const http = require('http')

var sockets = []

var proxyServer = http.createServer(function(req, res) {
  res.send(200)
})

var port = 8000

proxyServer.listen(port, (err) => {
  if (err) { throw err }
  log('proxyServer listening on port ' + port);
})

var ws = new WebSocketServer({
  httpServer: proxyServer,
  autoAcceptConnections: false
})

ws.on('request', function(req) {
  req.accept('echo-protocol', req.origin)
})

ws.on('connect', function(connection) {
  log('new connection on proxy server')
  connection.send('connected to proxy')

  var targetConnection;

  connection.on('message', function(msg) {
    if (msg.type === 'utf8') {
      msg = msg.utf8Data
      log('proxy server received msg: ' + msg)


      if (msg.split(':')[0] === 'requestSingleSocket') {
        var msgSplit = msg.split(':')
        msgSplit.shift()
        var targetConnectionURL = msgSplit.join(':')
        log('target connection is: ' + targetConnectionURL);

        var socket = new WebSocket(targetConnectionURL, 'echo-protocol')

        sockets[targetConnectionURL] = socket

        socket.onopen = function() {
          log('socket opened for ' + targetConnectionURL)
        }

        socket.onerror = function() {
          log('connection error')
        }

        socket.onclose = function() {
          log('socket close')
        }

        socket.onmessage = function(e) {
          if (typeof e.data === 'string') {
            log("Received: '" + e.data + "'");
          }
        }
      }
    }
    connection.send('got your msg')
  })
})

function log (msg) {
  console.log('proxy: ' + msg)
}
