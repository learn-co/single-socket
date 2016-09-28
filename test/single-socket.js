const SingleSocket = require('../lib/single-socket')
const expect = require('chai').expect
const sinon = require('sinon')
const dnode = require('dnode')

describe('connnecting and closing', function() {
  before(function(done) {
    this.spy = sinon.spy()

    this.socket = new SingleSocket('ws://localhost:8001')

    this.socket.on('open', () => {
      this.spy()
      done()
    })
  })

  it('connects to the target ws server', function() {
    expect(this.spy.calledOnce).to.be.true
    expect(this.socket.socket).to.be.defined
  })

  it('can close the websocket', function(done) {
    var spy = sinon.spy()

    this.socket.on('close', () => {
      spy()
      expect(spy.calledOnce).to.be.true
      expect(this.socket.socket).to.be.undefined
      done()
    })

    this.socket.close()
  })
})

it('calls onerror when theres an error with the websocket connection', function(done) {
  var self = this

  this.stopServer().then(function() {
    var socket = new SingleSocket('ws://localhost:8001')

    socket.on('error', function(err) {
      expect(err.code).to.equal('ECONNREFUSED')
      self.startServer().then(function() {
        done()
      })
    })
  })
})

it('sends and receives messages', function(done) {
  var socket = new SingleSocket('ws://localhost:8001')

  socket.on('open', function() {
    socket.send('ping')
  })

  socket.on('message', function(msg) {
    if (msg === 'pong') {
      done()
    }
  })
})

it('closes when the websocket closes', function(done) {
  var spy = sinon.spy()

  var self = this
  var stoppingServer;

  var socket = new SingleSocket('ws://localhost:8001')

  socket.on('open', () => {
    stoppingServer = self.stopServer()
  })

  socket.on('close', () => {
    spy()
    expect(spy.calledOnce).to.be.true
    stoppingServer.then(function() {
      self.startServer().then(function() {
        done()
      })
    })
  })
})

it('the server shuts down when all clients have disconnected', function() {
})
