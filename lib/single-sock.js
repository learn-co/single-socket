'use babel';

var WebSocket = require('websocket').w3cwebsocket
var fork = require('child_process').fork;
var messenger = require('messenger');
var path = require('path');

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'single-sock:toggle': () => this.toggle()
    }));

    this.init();
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  toggle() {
    this.init()
  },

  init() {
    var p = fork(path.join(__dirname, 'spawn.js'));
    console.log(p)

    p.on('message', function(m) {
      console.log('received: ', m)
    });

    p.on('error', function(e) {
      console.log('child process error', e)
    });

    client = messenger.createSpeaker(8000);

    setInterval(function(){
      client.request('give it to me', {hello:'world'}, function(data){
        console.log(data);
      });
    }, 1000);

    // console.log('debugging')

    // url = "wss://echo.websocket.org:443"

    // socket = new WebSocket(url)

    // socket.onerror = function(e) {
      // console.log('Connection Error');
      // console.log(e);
    // }

    // socket.onopen = function(e) {
      // console.log('WebSocket Client Connected');
      // console.log(e)
    // };

    // socket.onclose = function(e) {
      // console.log('echo-protocol Client Closed');
      // console.log(e)
    // };

    // socket.onmessage = function(e) {
      // if (typeof e.data === 'string') {
        // console.log("Received: '" + e.data + "'");
      // }
    // };
  }
};