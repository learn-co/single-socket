const SingleSocket = require('../lib/single-socket')
const expect = require('chai').expect
const sinon = require('sinon')
const dnode = require('dnode')

it('connects to the target ws server', function(done) {
  this.timeout(10000)
  var spy = sinon.spy()

  var socket = new SingleSocket('ws://localhost:8001', {
    onopen: function() {
      spy()
      expect(spy.calledOnce).to.be.true
      done()
    }
  })
})

it('calls onerror when theres an error with the websocket connection', function(done) {
  this.timeout(10000)
  var self = this

  this.stopServer().then(function() {
    var socket = new SingleSocket('ws://localhost:8001', {
      onerror: function(err) {
        expect(err.type).to.equal('error')
        self.startServer().then(function() {
          done()
        })
      }
    })
  })
})

it('receives messages', function(done) {
  this.timeout(10000)

  var socket = new SingleSocket('ws://localhost:8001', {
    onmessage: function(msg) {
      msg = JSON.parse(msg)
      expect(msg.ping).to.equal('pong')
      done()
    }
  })
})

it('closes when the websocket closes', function(done) {
  this.timeout(10000)

  var spy = sinon.spy()

  var self = this
  var stoppingServer;

  var socket = new SingleSocket('ws://localhost:8001', {
    onopen: function() {
      stoppingServer = self.stopServer()
    },

    onclose: function(msg) {
      spy()
      expect(spy.calledOnce).to.be.true
      stoppingServer.then(function() {
        self.startServer().then(function() {
          done()
        })
      })
    }
  })
})

it('allows you to specify the port the start the dnode server', function(done) {
  this.timeout(10000)

  var port = 9000
  var spy = sinon.spy()

  var socket = new SingleSocket('ws://localhost:8001', {
    onopen: function() {
      spy()
      expect(spy.calledOnce).to.be.true
      done()
    },
    port: port
  })

  function connect() {
    var client = dnode().connect(port)

    client.on('error', function() {
      console.log('error')
      setTimeout(function() {
        console.log('retrying')
        connect()
      }, 100)
    })

    client.on('remote', function(remote) {
      spy()
      expect(spy.calledOnce).to.be.true
      done()
    })
  }
})

xit('shuts down the dnode server when the last client disconnects', function() {
})
