const ipc = require('node-ipc')
const Websocket = require('ws')

function log(msg, detail) {
  var logPath = path.join(process.env.HOMEPATH, 'learn-ide.log');
  fs.appendFile(logPath, `\n${msg}: ${detail}`);
}

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
        log('WS MESSAGE', msg)
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
      log('OPENED', url)
      resolve(ws)
    })

    ws.on('error', (e) => {
      log('ERROR', e)
      delete websockets[url]
    })

    ws.on('close', (e) => {
      log('CLOSE', e)
      delete websockets[url]
    })
  })
}

function exitIfNoSocketsConnected() {
  if (!ipc.server.sockets.length) {
    process.exit(0)
  }
}
