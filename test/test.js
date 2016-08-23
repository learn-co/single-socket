const path = require('path')
const fork = require('child_process').fork

before(function(done) {
  var port = 8001
  console.log('starting target websocket server on port ' + port)
  this.wsServer = fork(path.join(__dirname, 'ws-server.js'), [port])
  setTimeout(done, 1500)
})

after(function() {
  console.log('killing websocket server')
  this.wsServer.kill()
})

require('./single-socket')
