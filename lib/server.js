const messenger = require('messenger');
const WebSocket = require('websocket').w3cwebsocket;
const WebSocketServer = require('websocket').server;
const http = require('http');

var url = ""

var socket = new WebSocket(url, 'echo-protocol')

socket.onerror = function(e) {
  console.log('Connection Error');
  console.log(e);
}

socket.onopen = function(e) {
  console.log('WebSocket Client Connected');
  console.log(e)
};

socket.onclose = function(e) {
  console.log('echo-protocol Client Closed');
  console.log(e)
};

socket.onmessage = function(e) {
  if (typeof e.data === 'string') {
    console.log("Received: '" + e.data + "'");
  }
};

var server = http.createServer(function(req, res) {
  console.log('requested url')
  console.log(req.url);
  res.end('Hello World');
});

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
  var connection  = req('echo-protocol', req.origin);
  console.log((new Date()) + ' Connection accepted.')

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF(message.utf8Data);
    }
    else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
    }
  });

  connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});

wsServer.on('connect', function(wsConnection) {
  console.log('connected a websocket')
  console.log(wsConnection)
  wsConnection.send('heyo you made it!')
});



// const time = Date.now();
// const client = messenger.createSpeaker(8001);
// const server = messenger.createListener(8000);

// server.on('ping', function(message, data){
  // client.shout('wutang', {wutang: 'wutang', data: data});
  // message.reply({msg: 'pong'})
// });
