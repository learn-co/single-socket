const SingleSocket = require('../lib/single-socket')
const expect = require('chai').expect
const sinon = require('sinon')

it('connects to the target ws server', function(done) {
  this.timeout(5000)
  var spy = sinon.spy()

  var socket = new SingleSocket('ws://localhost:8001', {
    onopen: function() {
      spy()
      expect(spy.calledOnce).to.be.true
      done()
    }
  })
})
