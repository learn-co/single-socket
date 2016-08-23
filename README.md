# SingleSocket

> Note: This project is experimental for now and still under active development

Share a single websocket connection across Node processes.

## How It Works

SingleSocket uses a local [dnode](https://github.com/substack/dnode) server to route clients through a single websocket connection.

## Install

`npm install single-socket --save`

## Usage

```javascript
const SingleSocket = require('single-socket')

var client = new SingleSocket('ws://echo.websocket.org')

client.onerror = function() {
  console.log('Connection Error')
}

client.onopen = function() {
  console.log('Client Connected')
}

client.onclose = function() {
  console.log('Client Closed');
}

client.onmessage = function(e) {
  if (typeof e.data === 'string') {
      console.log("Received: '" + e.data + "'");
  }
}
```
