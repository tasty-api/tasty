const path = require('path');
const requireDir = require('require-dir');
const Service = require('./Service');

class Services {
  init(srcDir = path.join(process.cwd(), 'services')) {
    requireDir(srcDir, {
      recurse: true,
    });
  }

  register(name, opts) {
    this[name] = new Service(opts);
  }
};

module.exports = Services;
