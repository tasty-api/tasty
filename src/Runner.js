const path = require('path');
const recursive = require('recursive-readdir');
const merge = require('deepmerge');

const FUNC = 'func';

/** Class representing a test runner */
class Runner {
  /**
   * Create a test runner
   * @param {string} [dir = '/test'] - Path to functional tests directory
   */
  constructor(dir = path.join(process.cwd(), 'test')) {
    this.func = {
      dir: path.join(dir, 'func')
    };
  }

  /**
   * Run tests by type
   * @param {string} type - Type of tests, could be func or load
   * @param {boolean} isParallel - Flag for running tests in parallel mode
   */
  // @todo Implement support for load testing
  async run(type = FUNC, isParallel = false) {
    const { get, run } = require(`./types/${type}`);
    const testsFiles = await this._getTestsFiles(type);
    const tests = await get(testsFiles);

    return run(tests, isParallel);
  }

  // @todo implement filtration
  update(options) {
    this.config = merge(this.config, options, {
      arrayMerge: (destArray, srcArray) => srcArray,
    });
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
    return await recursive(this[type].dir);

    // @todo Make sorts
    // @todo Make filtration
  }
}

module.exports = Runner;
