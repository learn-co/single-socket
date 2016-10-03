console.log('process successfully forked')

const ipc = require('node-ipc')
const Websocket = require('ws')

const websockets = {}

ipc.config.id = 'single-socket'

ipc.serve(() => {
  ipc.server.on('socket.disconnected', (socket, destroyedSocketID) => {
    if (!ipc.server.sockets.length) {
      process.exit(0)
    }
  })

  ipc.server.on('ss:connect', (url, socket) => {
    getSocket(url).then((ws) => {
      ws.on('message', (msg) => {
        ipc.server.emit(socket, 'ws:message', msg)
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

    ws.on('error', reject)

    ws.on('open', () => {
      websockets[url] = ws
      resolve(ws)
    })

    ws.on('error', () => {
      delete websockets[url]
    })

    ws.on('close', () => {
      delete websockets[url]
    })
  })
}
