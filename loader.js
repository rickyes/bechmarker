'use strict';

const fs = require('fs');
const path = require('path');

class Loader {
  constructor(opts = {}) {
    this.apiDirs = opts.apiDirs || [__dirname];
  }

  load() {
    return (this.apiDirs)
      .reduce((apis, root) => fs.readdirSync(root)
        .filter((filename) => path.extname(filename) === '.json')
        .map((filename) => ({
          root,
          filename,
        }))
        .reduce(this.assignOn, apis), []);
  }

  assignOn(apis, f) {
    const absPath = path.join(f.root, f.filename);
    const moduleAPIs = require(absPath);
    if (moduleAPIs.apis && moduleAPIs.apis.length) {
      moduleAPIs.apis.forEach((v) => apis.push(v));
    }
    return apis;
  }
}

module.exports = Loader;
