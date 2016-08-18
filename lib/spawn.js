var messenger = require('messenger');

const time = Date.now();

server = messenger.createListener(8000);

server.on('give it to me', function(message, data){
  message.reply({'you':'got it', time: time})
});
