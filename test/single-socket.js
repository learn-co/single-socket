const SingleSocket = require('../lib/single-socket')
const expect = require('chai').expect
const sinon = require('sinon')
const dnode = require('dnode')

describe('connnecting and closing', function() {
  before(function(done) {
    this.timeout(10000)
    this.spy = sinon.spy()

    this.socket = new SingleSocket('ws://localhost:8001')

    this.socket.on('open', () => {
      this.spy()
      done()
    })
  })

  it('connects to the target ws server', function() {
    expect(this.spy.calledOnce).to.be.true
  })

  // it('closes', function(done) {
    // var spy = sinon.spy()
    // this.socket.close().then(function() {
      // spy()
      // expect(spy.calledOnce).to.be.true
      // done()
    // })
  // })
})

it('calls onerror when theres an error with the websocket connection', function(done) {
  this.timeout(10000)
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

// it('receives messages', function(done) {
  // this.timeout(10000)

  // var socket = new SingleSocket('ws://localhost:8001', {
    // onmessage: function(msg) {
      // msg = JSON.parse(msg)
      // expect(msg.ping).to.equal('pong')
      // done()
    // }
  // })
// })

it('closes when the websocket closes', function(done) {
  this.timeout(10000)

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

// it('allows you to specify the port the start the dnode server', function(done) {
  // this.timeout(10000)

  // var port = 9000
  // var spy = sinon.spy()

  // var socket = new SingleSocket('ws://localhost:8001', {
    // onopen: function() {
      // checkIfDnodeServerIsRunning(port)
    // },
    // port: port
  // })

  // function checkIfDnodeServerIsRunning(port) {
    // var client = dnode({}, {weak: false}).connect(port)

    // client.on('remote', function(remote) {
      // spy()
      // expect(spy.calledOnce).to.be.true
      // done()
    // })
  // }
// })

// xit('shuts down the dnode server when the last client disconnects', function() {
// })
