var messenger = require('messenger');

const time = Date.now();

server = messenger.createListener(8000);
client = messenger.createSpeaker(8001);

server.on('ping', function(message, data){
  message.reply({msg: 'pong'})
  // client.shout('wutang', {wutang: 'wutang'});
});
