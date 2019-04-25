const path = require('path');
const recursive = require('recursive-readdir');

const FUNC = 'func';

/** Class representing a test runner */
module.exports = class Runner {
  /**
   * Create a test runner
   * @param {string} [dir = '/test'] - Path to functional tests directory
   */
  constructor(dir = path.join(process.cwd(), 'test')) {
    this.func = {
      dir
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
};
