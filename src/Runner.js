const fs = require('fs');
const path = require('path');
const recursive = require('recursive-readdir');
const Readable = require('stream').Readable;
const _ = require('lodash');
const driverProvider = require('./DriverProvider');
const config = require('../config');

const DEFAULT_TYPE = 'func';

const RUNNER_STATUS = {
  IN_PROCESS: 'inProcess',
  IN_PENDING: 'inPending',
  FAILED: 'failed',
};

/** Class representing a test runner */
class Runner {
  /**
   * Create a test runner
   * @param {string} [dir = '/test/[type]'] - Path to functional tests directory
   * @param {string} funcCfg - Path to functional tests configuration file
   * @param {string} loadCfg - Path to load tests configuration file
   */
  constructor({
    testsDir= path.join(process.cwd(), 'test'),
    postmanCollection = null,
    funcCfg = path.join(process.cwd(), '.mocharc.js'),
    loadCfg = path.join(process.cwd(), '.artilleryrc.js')
  }) {
    this.func = {
      dir: fs.existsSync(path.join(testsDir, 'func')) ? path.join(testsDir, 'func') : testsDir,
    };
    this.load = {
      dir: path.join(testsDir, 'load'),
    };

    if (postmanCollection) {
      config.set('postman:collection', postmanCollection);
    }

    this.logStream = new Readable({
      read: () => {},
    });

    config.set('func_cfg', fs.existsSync(funcCfg) ? funcCfg : path.join(__dirname, '..', 'config', '.mocharc.js'));
    config.set('load_cfg', fs.existsSync(loadCfg) ? loadCfg : path.join(__dirname, '..', 'config', '.artilleryrc.js'));

    driverProvider.setDrivers({ func: 'mocha', load: 'artillery' });
  }

  /**
   * Run tests by type
   * @param {string} type - Type of tests, could be func or load
   * @param {boolean} isParallel - Flag for running tests in parallel mode
   * @param {string[]} [files] - Files for testing
   * @param {object} eventHandlersMap - Map of functions to be executed
   * @param {Function} eventHandlersMap.onTestEnd - Callback to be executed after a single test ends
   */
  async run(type = DEFAULT_TYPE, isParallel = false, files = [], eventHandlersMap) {
    this.type = type;
    driverProvider.setRunType(type);

    const driver = driverProvider.resolve();
    const testsFiles = files.length ? files : await this._getTestsFiles(type);
    const tests = driver.get(testsFiles);

    this.status = RUNNER_STATUS.IN_PROCESS;

    const stats =  await driver.run(tests, isParallel, this.logStream, eventHandlersMap).catch(err => {
      this.status = RUNNER_STATUS.FAILED;

      throw err;
    });

    this.status = RUNNER_STATUS.IN_PENDING;

    const statsFile = path.join(process.cwd(), 'logs', type === 'func' ? 'func_stats.json' : 'load_stats.json');

    fs.writeFileSync(statsFile, JSON.stringify(stats), { encoding: 'utf8' });

    return stats;
  }

  getCurrentType() {
    return this.type;
  }

  // @todo implement filtration
  setFilters(filters) {
    this.filters = filters;
  }

  getStatus() {
    return this.status;
  }

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
    const files = await recursive(path.join(this[type].dir));
    const tests = _.get(this, 'filters.tests', files);

    if (!tests.length) return files; //@todo check if needed

    return _.filter(files, file => _.includes(tests, file));
    // @todo Make sorts
    // @todo Make filtration
  }
}

module.exports = Runner;
