const path = require('path');
const recursive = require('recursive-readdir');
const log = require('../libs/log')(module);
const artillery = require('./types/load/artillery');
const fs = require('fs');
const { promisify } = require('util');
const merge = require('deepmerge');

const DEFAULT_TYPE = 'func';

const required = (param = null, defaultValue = null) => {
  if (!defaultValue) {
    throw new Error(param ? `missing parameter: ${param}` : 'missing parameter');
  }
  return defaultValue;
};

/** Class representing a test runner */
class Runner {
  /**
   * Create a test runner
   * @param {string} [dir = '/test/[type]'] - Path to functional tests directory
   */
  constructor(dir = path.join(process.cwd(), 'test')) {
    this.dir = dir;
    this.func = {
      dir: path.join(dir, 'func')
    };
    this.load = {
      dir: path.join(dir, 'load')
    };
  }

  /**
   * Run tests by type
   * @param {string} type - Type of tests, could be func or load
   * @param {string} config - Type of tests, could be func or load
   * @param {boolean} isParallel - Flag for running tests in parallel mode
   */
  async run(type = DEFAULT_TYPE, cwd = process.cwd(), config = path.resolve(__dirname, '../config/artillery'), isParallel = false) {
    this.type = type;
    process.env.type = type;

    const { get, run } = require(`./types/${type}`);
    const testsFiles = await this._getTestsFiles(type);
    let tests = await get(testsFiles);


    let pathToSaveFile = null;//@todo this is for artillery configuration()! delete it further
    let pathToExecuteLoad = null;//@todo fix this!
    if (type === 'load') {
      const _config = require(path.resolve(config));
      //add tests http flow to scenarios:
      const scenarios = (new artillery.Scenario(tests)).get();
      artillery.Artillery.setConfiguration(_config);
      //create artillery final configuration
      artillery.Artillery.changeTarget('https://dev-api-internal-p2p.apigee.lmru.tech/magasin_api').addScenarioSection(scenarios);
      tests = artillery.Artillery.get();
      pathToSaveFile = path.resolve(path.join(cwd, 'artillery_report'));
      pathToExecuteLoad = path.join(cwd, './artilleryConfigFinal.json');

      const writeFile = promisify(fs.writeFile);
      const readFile = promisify(fs.readFile);
      await writeFile(
        pathToExecuteLoad,
        JSON.stringify(artillery.Artillery.get(), null, 2)
      );
    }
    
    return run(pathToExecuteLoad || tests, pathToSaveFile || isParallel);
  }


  getCurrentType() {
    return this.type;
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
    return await recursive(path.join(this[type].dir));

    // @todo Make sorts
    // @todo Make filtration
  }
}

module.exports = Runner;
