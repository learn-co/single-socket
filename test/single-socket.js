const SingleSocket = require('../lib/single-socket')
const expect = require('chai').expect
const sinon = require('sinon')

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

  var socket = new SingleSocket('ws://localhost:8001', {
    onopen: function() {
      self.stopServer()
    },

    onclose: function(msg) {
      spy()
      expect(spy.calledOnce).to.be.true
      self.startServer().then(function() {
        done()
      })
    }
  })

})
