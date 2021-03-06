const ipc = require('node-ipc')
const Websocket = require('ws')
const logger = require('./logger')
const os = require('os')
const path = require('path')
const fs = require('fs')

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

  ipc.server.on('ss:connect', (args, socket) => {
    args || (args = {})
    var {url, logFile} = args
    var log = logger(logFile)

    getSocket(url).then((ws) => {
      ws.on('message', (msg) => {
        log.info('message from websocket, about to emit to ipc', {msg: msg, url: url})
        ipc.server.emit(socket, 'ws:message', msg)
        log.info('just emitted message to websocket')
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
