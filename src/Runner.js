const fs = require('fs');
const path = require('path');
const recursive = require('recursive-readdir');
const driverProvider = require('./DriverProvider');
const config = require('../config');

const DEFAULT_TYPE = 'func';

/** Class representing a test runner */
class Runner {
  /**
   * Create a test runner
   * @param {string} [dir = '/test/[type]'] - Path to functional tests directory
   * @param {string} funcCfg - Path to functional tests configuration file
   * @param {string} loadCfg - Path to load tests configuration file
   */
  constructor(dir = path.join(process.cwd(), 'test'), funcCfg = path.join(process.cwd(), '.mocharc.js'), loadCfg = path.join(process.cwd(), '.artilleryrc.js')) {
    this.func = {
      dir: path.join(dir, 'func'),
    };
    this.load = {
      dir: path.join(dir, 'load'),
    };

    config.set('func_cfg', fs.existsSync(funcCfg) ? funcCfg : path.join(__dirname, '..', 'config', '.mocharc.js'));
    config.set('load_cfg', fs.existsSync(loadCfg) ? loadCfg : path.join(__dirname, '..', 'config', '.artilleryrc.js'));

    driverProvider.setDrivers({ func: 'mocha', load: 'artillery' });
  }

  /**
   * Run tests by type
   * @param {string} type - Type of tests, could be func or load
   * @param {boolean} isParallel - Flag for running tests in parallel mode
   */
  async run(type = DEFAULT_TYPE, isParallel = false) {
    this.type = type;
    driverProvider.setRunType(type);

    // this.console

    const driver = driverProvider.resolve();
    const testsFiles = await this._getTestsFiles(type);
    const tests = driver.get(testsFiles);

    return driver.run(tests, isParallel, /*this.logStream*/);
  }

  getCurrentType() {
    return this.type;
  }

  // @todo implement filtration
  update(options) {}

  // @todo implement filtration
  async getFilter(type) {
    const files = await this._getTestsFiles(type) || [];

    return files.reduce((filter, file) => {
      filter[file] = true;

      return filter;
    }, {});
  }

  /**
   * Get tests files
   * @param {string} type - Tests' type, func | load
   * @returns {string[]} Array of tests paths
   * @private
   */
  async _getTestsFiles(type) {
    return await recursive(path.join(this[type].dir));

    // @todo Make sorts
    // @todo Make filtration
  }
}

module.exports = Runner;
