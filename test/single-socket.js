const SingleSocket = require('../lib/single-socket')
const expect = require('chai').expect
const sinon = require('sinon')

// xit('connects to the target ws server', function(done) {
  // this.timeout(5000)
  // var spy = sinon.spy()

  // var socket = new SingleSocket('ws://localhost:8001', {
    // onopen: function() {
      // spy()
      // expect(spy.calledOnce).to.be.true
      // done()
    // }
  // })
// })

it('calls onerror when theres an error with the websocket connection', function(done) {
  this.timeout(10000)
  var self = this

  this.stopServer(function() {
    console.log('jaksdfjlaskdjflaksdjflkasdjfklasdjfklasjdl')
    var socket = new SingleSocket('ws://localhost:8001', {
      onerror: function(err) {
        log('wuuuu')
        log(err)
        expect(err).to.be.an('error')
        self.startServer(function() {
          done()
        })
      }
    })
  })

})

// it('receives messages', function(done) {
  // var socket = new SingleSocket('ws://localhost:8001', {
    // onmessage: function(msg) {
      // // this response is hard coded as a response
      // // on open connections to the test ws server
      // // in `test/ws-server`

      // console.log('wu tanggggg')
      // expect(msg.ping).to.equal('pong')
      // done()
    // }
  // })
// })
