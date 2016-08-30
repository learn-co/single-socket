const http = require('http')
const WebSocketServer = require('websocket').server

var port = process.argv[2]

var server = http.createServer(function(request, response) {
  response.writeHead(404);
  response.end();
})

server.listen(port)

var wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: true
})

wsServer.on('connect', function(connection) {
  setInterval(function() {
    connection.send(JSON.stringify({ping: 'pong'}))
  }, 1000)
})
