const SingleSocket = require('../lib/single-socket')
const expect = require('chai').expect
const sinon = require('sinon')

it('connects to the target ws server', function(done) {
  var onopenSpy = sinon.spy()

  var socket = new SingleSocket('ws://localhost:8001', {
    onopen: function() {
      console.log('on open executed')
      onopenSpy()
    }
  })

  setTimeout(function() {
    expect(onopenSpy.calledOnce).to.be.true
    done()
  }, 1500)
})
