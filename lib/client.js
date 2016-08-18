const WebSocket = require('websocket').w3cwebsocket;

var url = 'ws://localhost:8000'

var socket = new WebSocket(url, 'echo-protocol');

socket.onerror = function(e) {
  console.log('Connection Error');
  console.log(e);
}

socket.onopen = function(e) {
  console.log('WebSocket Client Connected');
  console.log(e)
  socket.send('hello world');
};

socket.onclose = function(e) {
  console.log('echo-protocol Client Closed');
  console.log(e)
};

socket.onmessage = function(e) {
  console.log(e)
  console.log('received emssage')
  if (typeof e.data === 'string') {
    console.log("Received: '" + e.data + "'");
  }
};


