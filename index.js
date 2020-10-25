'use strict';

const Loader = require('./loader');
const Benchmarker = require('./benchmarker');

/**
 * @param {Object} opts
 */
function run(opts = {}) {
  const loader = new Loader(opts.apiDirs);
  const bench = new Benchmarker({
    ...omit(opts, 'apiDirs'),
    apis: loader.load(),
  });
  bench.make();
}
