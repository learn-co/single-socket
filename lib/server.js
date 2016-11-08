const ipc = require('node-ipc')
const Websocket = require('ws')
const logger = require('./logger')
const tmp = require('tmp')

const websockets = {}

var firstSocketHasConnected = false

setTimeout(exitIfNoSocketsConnected, 10 * 1000)

ipc.config.id = 'single-socket'

ipc.serve(() => {
  ipc.server.on('connect', (socket) => {

    if (!firstSocketHasConnected) {
      setInterval(exitIfNoSocketsConnected, 1000)
    }

    firstSocketHasConnected = true
  })

  ipc.server.on('socket.disconnected', exitIfNoSocketsConnected)

  ipc.server.on('ss:connect', (url, socket) => {
    getSocket(url).then((ws) => {
      ws.on('message', (msg) => {
        try {
          var logMsg = JSON.parse(msg)
          if (logMsg.type === 'sync') {
            logger.info('creating tmp')
            return tmp.file((err, path, fd, cleanupCallback) => {
              logger.info('created tmp: ' + path)
              ipc.server.emit(socket, 'ws:message:tmp', path)
            })
          }
        } catch (e) {
          logger.log('error parsing the msg', {error: e})
          var logMsg = msg
        }

        logger.info('ss:server:ws:msg', {msg: logMsg, url: url})
        try {
          logger.info('ss:server:ws:msg:length', msg.length)
          ipc.server.emit(socket, 'ws:message', logMsg)
        } catch (e) {
          logger.error('ss:server:emit:error', {error: e})
        }
        logger.info('ss:server:ws:msg:emitted')
      })

      ws.on('close', () => {
        ipc.server.emit(socket, 'ws:close', url)
      })

      ipc.server.emit(socket, 'ws:open', url)
    }).catch((err) => {
      ipc.server.emit(socket, 'ws:error', err)
    })
  })

  ipc.server.on('ss:close', (url, socket) => {
    getSocket(url).then((ws) => {
      ws.close()
    })
  })

  ipc.server.on('ss:message', (data, socket) => {
    getSocket(data.url).then((ws) => {
      ws.send(data.msg)
    })
  })
})

ipc.server.start()

function getSocket(url) {
  return new Promise((resolve, reject) => {
    if (websockets[url]) {
      resolve(websockets[url])
      return
    }

    var ws = new Websocket(url)

    ws.on('open', () => {
      websockets[url] = ws
      resolve(ws)
    })

    ws.on('error', (err) => {
      delete websockets[url]
      reject()
    })

    ws.on('close', () => {
      delete websockets[url]
    })
  })
}

function exitIfNoSocketsConnected() {
  if (!ipc.server.sockets.length) {
    process.exit(0)
  }
}
