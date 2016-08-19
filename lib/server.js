const WebSocket = require('websocket').w3cwebsocket
const WebSocketServer = require('websocket').server
const http = require('http')

var proxyServer = http.createServer(function(req, res) {
  res.send(200)
})

var port = 8000

proxyServer.listen(port, (err) => {
  if (err) { throw err }
  log('proxyServer listening on port ' + port);
})

var ws = new WebSocketServer({httpServer: proxyServer})

ws.on('request', function(req) {
  log('request origin: ', req.origin)
  req.accept('echo-protocol', req.origin)
})

ws.on('connect', function(connection) {
  log('new connection on proxy server')
  connection.send('connected to proxy')

  connection.on('message', function(msg) {
    log('received: ' + msg.utf8Data)
    connection.send('got your msg')
  })
})

function log (msg) {
  console.log(msg)
}
