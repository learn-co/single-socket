'use babel';

var WebSocket = require('websocket').w3cwebsocket
var fork = require('child_process').fork;
var messenger = require('messenger');
var path = require('path');

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  spawningServer: false,

  serverProcess: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'single-socket:toggle': () => this.toggle()
    }));

    this.init();
  },

  deactivate() {
    this.subscriptions.dispose();

    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  },

  toggle() {
    this.init()
  },

  init() {
    var client = messenger.createSpeaker(8000);
    var self = this;

    setInterval(function(){
      client.request('ping', {msg: 'ping'}, function(data){
        console.log(data)

        if (data.error && !self.spawningServer) {
          console.log('spawning server')
          self.spawnServer();
        }
      });
    }, 1000);

    var server = messenger.createListener(8001);

    server.on('wutang', function(msg) {
      console.log('received message wutang pushed from the server', msg)
    });

  },

  spawnServer() {
    this.spawningServer = true;

    this.serverProcess = fork(path.join(__dirname, 'server.js'));

    this.serverProcess.on('message', function(m) {
      console.log('received: ', m)
    });

    this.serverProcess.on('error', function(e) {
      console.log('child process error', e)
    });
  }
};
