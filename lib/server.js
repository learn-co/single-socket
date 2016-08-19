// const WebSocket = require('websocket').w3cwebsocket
const WebSocketServer = require('ws').Server
const http = require('http')

var wss = new WebSocketServer({port: 8000})

wss.on('connection', function(ws) {
  log('new connection on proxy server')

  setInterval(function() {
    ws.send('connected to proxy')
  }, 1000)
})

wss.on('error', function(e) {
  log('error on the server')
  log(e)
})

// ws.on('request', function(req) {
  // log('new connection request')
  // req.accept('echo-protocol', req.origin)
// })

// ws.on('connect', function(connection) {

  // var targetConnection;

  // connection.on('message', function(msg) {
    // if (msg.type === 'utf8') {
      // msg = msg.utf8Data
      // log('proxy server received msg: ' + msg)


      // if (msg.split(':')[0] === 'requestSingleSocket') {
        // var msgSplit = msg.split(':')
        // msgSplit.shift()
        // var targetConnectionURL = msgSplit.join(':')
        // log('target connection is: ' + targetConnectionURL);


        // var socket = sockets[targetConnectionURL] || new WebSocket(targetConnectionURL, 'echo-protocol')

        // sockets[targetConnectionURL] = socket

        // socket.onopen = function() {
          // log('socket opened for ' + targetConnectionURL)
        // }

        // socket.onerror = function() {
          // log('connection error')
        // }

        // socket.onclose = function() {
          // log('socket close')
        // }

        // socket.onmessage = function(e) {
          // if (typeof e.data === 'string') {
            // log("Received: '" + e.data + "'");
          // }
        // }
      // }
    // }
    // connection.send('got your msg')
  // })
// })

// ws.on('close', function(connection, reason, description) {
  // log('closed connection')
// })

function log (msg) {
  console.log('proxy: ' + msg)
}
