const WebSocket = require('websocket').w3cwebsocket
const WebSocketServer = require('websocket').server
const http = require('http')

var url = ''
var socket = new WebSocket(url, 'echo-protocol')

socket.onerror = function(e) {
  console.log('Connection Error')
  console.log(e);
}

socket.onopen = function(e) {
  console.log('WebSocket Client Connected')
  console.log(e)
}

socket.onclose = function(e) {
  console.log('echo-protocol Client Closed')
  console.log(e)
}

socket.onmessage = function(e) {
  if (typeof e.data === 'string') {
    console.log("Received: '" + e.data + "'")
  }
}

var server = http.createServer(function(req, res) {
  console.log('requested url')
  console.log(req.url);
  res.end('Hello World');
})

var port = 8000;

server.listen(port, (err) => {
  if (err) {
    console.log('something bad happened')
  }
  console.log('server listening on port ' + port);
})

var wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: true
});

wsServer.on('request', function(req) {
  req('echo-protocol', req.origin)
});

wsServer.on('connect', function(wsConnection) {
  console.log('connected a websocket')
  console.log(wsConnection)
  wsConnection.send('heyo you made it!')

  wsConnection.on('message', function(msg) {
    console.log('wu tang ')
    console.log('received: %s', msg.utf8Data)
    wsConnection.send('got  your message')
  })
});
