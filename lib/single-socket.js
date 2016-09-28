const EventEmitter = require('events')
const fork = require('child_process').fork

class SingleSocket extends EventEmitter {
  constructor(url) {
    this.url = url
  }
}

module.exports = SingleSocket
