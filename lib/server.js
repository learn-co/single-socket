const ipc = require('node-ipc')
const Websocket = require('ws')
const logger = require('./logger')
const temp = require('temp')

const websockets = {}

var firstSocketHasConnected = false

setTimeout(exitIfNoSocketsConnected, 10 * 1000)

ipc.config.id = 'single-socket'

logger.info('ss:serve')
ipc.serve(() => {
  ipc.server.on('connect', (socket) => {
    logger.info('ss:connect')

    if (!firstSocketHasConnected) {
      setInterval(exitIfNoSocketsConnected, 1000)
    }

    firstSocketHasConnected = true
  })

  ipc.server.on('socket.disconnected', exitIfNoSocketsConnected)

  ipc.server.on('ss:connect', (url, socket) => {
    getSocket(url).then((ws) => {
      ws.on('message', (msg) => {
        if (msg.length < 1000) {
          logger.info('ss:server:ws:msg', {msg: msg, url: url})
          ipc.server.emit(socket, 'ws:message', msg)
        } else {
          logger.info('large message!!!!')
          temp.open('ss', (err, info) {
            logger.info('writing large message to: ' + info.path)
            fs.write(info.fd, msg)
            fs.close(info.fd, (err) {
            })
          })
        }
      })

      ws.on('close', () => {
        logger.info('ss:server:ws:close', {url: url})
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
  logger.info(`ss:server getting socket for ${url}`)

  return new Promise((resolve, reject) => {
    if (websockets[url]) {
      logger.info('ss:server:ws:cache', {url: url})
      resolve(websockets[url])
      return
    }

    logger.info('ss:server:ws:create', {url: url})

    var ws = new Websocket(url)

    ws.on('open', () => {
      websockets[url] = ws
      logger.info('ss:server:ws:open', {url: url})
      resolve(ws)
    })

    ws.on('error', (err) => {
      delete websockets[url]
      logger.error('ss:server:ws:error', {url: url})
      reject()
    })

    ws.on('close', () => {
      logger.info('ss:server:ws:close', {url: url})
      delete websockets[url]
    })
  })
}

function exitIfNoSocketsConnected() {
  if (!ipc.server.sockets.length) {
    process.exit(0)
  }
}
