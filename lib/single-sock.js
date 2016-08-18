'use babel';

import { CompositeDisposable } from 'atom';

export default {

  singleSockView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    console.log('hello world')

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'single-sock:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.singleSockView.destroy();
  },

  serialize() {
    return {
      singleSockViewState: this.singleSockView.serialize()
    };
  },

  toggle() {
    console.log('SingleSock was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
