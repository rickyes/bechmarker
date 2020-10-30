'use strict';

const Loader = require('../loader');

class Mocker {
  constructor() {
    this.loader = new Loader({
      loadDirs: [__dirname],
        extname: '.js',
        excludes: ['index.js'],
    });
  }

  load() {
    
  }

  clear() {
      
  }
}

module.exports = Mocker;