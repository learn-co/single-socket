const ipc = require('node-ipc')
const Websocket = require('ws')

const sockets = {}

ipc.config.id = 'single-socket'

ipc.serve(() => {
  ipc.server.on('message', (data, socket) => {
    ipc.log('got a message: '.debug, data)
  })

  ipc.server.on('ws:connect', (url, socket) => {
    ipc.log(`received request to connect to ${url}`)

    getSocket(url).then((ws) => {
      ws.on('close', () => {
        ipc.server.emit(socket, 'ws:close', url)
      })

      ipc.server.emit(socket, 'ws:open', url)
    })
  })
})

ipc.server.start()

function getSocket(url) {
  return new Promise((resolve, reject) => {
    if (sockets[url]) {
      resolve(sockets[url])
    }

    var ws = new Websocket(url)
    ws.on('open', () => {
      sockets[url] = ws
      resolve(ws)
    })
    ws.on('error', reject)
  })
}
