# SingleSocket

Share a single websocket connection across Node processes.

## How It Works

SingleSocket uses a local proxy websocket server to route clients through a single connection.

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
