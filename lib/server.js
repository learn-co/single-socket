const ipc = require('node-ipc')
const Websocket = require('ws')

const websockets = {}

ipc.config.id = 'single-socket'

ipc.serve(() => {
  ipc.server.on('message', (data, socket) => {
    ipc.log('got a message: '.debug, data)
  })

  ipc.server.on('ws:connect', (url, socket) => {
    ipc.log(`received request to connect to ${url}`)

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
    console.log(`received request to close socket for ${url}`)
    getSocket(url).then((ws) => {
      ws.close()
    })
  })
})

ipc.server.start()

function getSocket(url) {
  return new Promise((resolve, reject) => {
    if (websockets[url]) {
      resolve(websockets[url])
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
