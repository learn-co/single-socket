var messenger = require('messenger');

const time = Date.now();

var server = messenger.createListener(8000);
var client = messenger.createSpeaker(8001);

server.on('ping', function(message, data){
  client.shout('wutang', {wutang: 'wutang', data: data});
  message.reply({msg: 'pong'})
});
