const path = require('path');
const requireDir = require('require-dir');
const log = require('../libs/log')(module);
const Resource = require('./Resource');

module.exports = class App {
  constructor(name, cfg) {
    this.name = name;
    Object.keys(cfg).forEach(opt => this[opt] = cfg[opt]);
  }

  init(srcDir = path.join(process.cwd(), 'app')) {
    requireDir(srcDir, {
      recurse: true,
    });
  }

  declare(opts) {
    const { url, alias, ...options } = opts;
    // log.debug(`Resource ${url} was registered`);
    // alias && log.debug(`Alias is ${alias}`);

    this[alias || url] = new Resource(opts, this);
  }
};
