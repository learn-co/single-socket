const http = require('http')
const WebSocketServer = require('websocket').server

var port = process.argv[2]

var server = http.createServer(function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(port, function() {
  console.log((new Date()) + ' Server is listening on port ' + port);
});

var wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: true
});

wsServer.on('connect', function(connection) {
  console.log('cliented connected on server')

  connection.on('message', function(message) {
    console.log('message: ', message)
  })
})
