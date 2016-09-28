# SingleSocket

> Note: This project is experimental for now and still under active development

Share a single websocket connection across Node processes.

## How It Works

SingleSocket uses a local socket (via [node-ipc](https://github.com/RIAEvangelist/node-ipc)) to route clients through a single websocket connection.

## Install

`npm install single-socket --save`

## Usage

```javascript
const SingleSocket = require('single-socket')

var client = new SingleSocket('ws://echo.websocket.org')


client.on('error', (err) => {
  console.error(err)
})

client.on('open', () => {
  console.log('Client Connected')
})

client.on('close', () => {
  console.log('Client Closed')
})

client.on('message', (msg) => {
  console.log(msg)
})

client.send('hello world')
```
