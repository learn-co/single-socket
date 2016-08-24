const path = require('path')
const fork = require('child_process').fork

global.log = function log() {
  console.log.apply(arguments)
}

before(function(done) {
  var port = 8001
  log('starting target websocket server on port ' + port)
  this.wsServer = fork(path.join(__dirname, 'ws-server.js'), [port])
  setTimeout(done, 1500)
})

after(function() {
  log('killing websocket server')
  this.wsServer.kill()
})

require('./single-socket')
