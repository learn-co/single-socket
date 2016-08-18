const messenger = require('messenger');
const WebSocket = require('websocket').w3cwebsocket

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



// const time = Date.now();
// const client = messenger.createSpeaker(8001);
// const server = messenger.createListener(8000);

// server.on('ping', function(message, data){
  // client.shout('wutang', {wutang: 'wutang', data: data});
  // message.reply({msg: 'pong'})
// });
