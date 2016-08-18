const messenger = require('messenger');
const WebSocket = require('websocket').w3cwebsocket;
const http = require('http');

url = ""

socket = new WebSocket(url)

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



// const time = Date.now();
// const client = messenger.createSpeaker(8001);
// const server = messenger.createListener(8000);

// server.on('ping', function(message, data){
  // client.shout('wutang', {wutang: 'wutang', data: data});
  // message.reply({msg: 'pong'})
// });
