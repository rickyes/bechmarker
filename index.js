'use strict';

const Loader = require('./loader');
const Benchmarker = require('./benchmarker');

/**
 * @param {Object} opts
 * @param {String} [opts.apiDir=./benchmarkers]
 * @param {String}
 */
module.exports = function benchmarker(opts = {}) {
  const loader = new Loader(opts.apiDirs);
  const bench = new Benchmarker({
    ...opts,
    apis: loader.load(),
  });
  return bench;
}
