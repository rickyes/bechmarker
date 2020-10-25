'use strict';

const path = require('path');
const { EventEmitter } = require('events');
const benchmarker = require('autocannon');
const reporter = require('autocannon-reporter');
const pkg = require('./package.json');

const benchmarkerName = pkg.name;
const benchmarkerVersion = pkg.version;
const agent = `${benchmarkerName}/${benchmarkerVersion}`;

const defaultHeader = {
  'User-Agent': agent,
  'Accept-Encoding': 'gzip, deflate, br',
  'Content-type': 'application/json; charset=utf-8',
};

class Benchmarker extends EventEmitter {
  /**
   * @param {Object} opts
   * @param {Array.<HTTPBenchmarkerMeta>} opts.apis
   * @param {String} [opts.baseURL=http://localhost]
   * @param {import('autocannon').Options} [opts.config]
   */
  constructor(opts = {}) {
    super();
    this.queues = opts.apis || [];
    this.baseURL = opts.baseURL || 'http://localhost';
    this.config = opts.config || {};
    this.on('completed', this.make);
    this.taskCount = 0;
    this.benchmarkerInstance = undefined;
    process.once('SIGINT', () => {
      // eslint-disable-next-line no-unused-expressions
      this.benchmarkerInstance && this.benchmarkerInstance.stop();
    });
  }

  make() {
    if (this.queues.length) {
      this.taskCount++;
      const api = this.prepareParams(this.queues.shift());
      this.benchmarkerInstance = benchmarker(api, (err, res) => {
        this.emit('completed');
        this.buildReport(res);
      });
      benchmarker.track(this.benchmarkerInstance, {
        renderProgressBar: true,
        renderResultsTable: true,
      });
    } else {
      this.emit('finish');
    }
  }

  /**
   * @param {HTTPBenchmarkerMeta} api
   */
  printTask(api) {
    if (this.taskCount === 1) {
      console.log(`Start Benchmark in bashURL of ${this.baseURL}`);
    }
    console.log(`\n\n==================== ${this.taskCount}、${api.title} ====================`);
    console.log('===>', `"${api.method}", "${api.url}"\n`);
  }

  /**
   * @param {HTTPBenchmarkerMeta} api
   */
  prepareParams(api) {
    if (!api || !api.url) return undefined;

    const originUrl = api.url;

    api.method = api.method.toUpperCase();
    api.headers = { ...defaultHeader, ...api.headers };
    Object.keys(api.params).forEach((param) => {
      api.url = api.url.replace(param, api.params[param]);
    });
    api.url = this.baseURL + api.url;

    delete api.params;

    this.printTask({ ...api, url: originUrl });

    return api;
  }

  buildReport(result) {
    const reportOutputPath = path.join(__dirname, 'report.html');
    reporter.writeReport(reporter.buildReport(result), reportOutputPath, (err) => {
      if (err) console.error('Error writting report: ', err);
    });
  }
}

module.exports = Benchmarker;

/**
 * @typedef {Object} HTTPBenchmarkerMeta
 * @property {String} title
 * @property {String} method
 * @property {String} url
 * @property {Object} headers
 * @property {Object} params
 * @property {Object} query
 * @property {Object} body
 */
