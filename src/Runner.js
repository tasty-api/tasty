const path = require('path');
const recursive = require('recursive-readdir');
// const config = require('../config');
const log = require('../libs/log')(module);
const artillery = require('./types/load/artillery');
const fs = require('fs');
const {promisify} = require('util');

const DEFAULT_TYPE = 'func';


const required = (param = null, defaultValue = null) => {
  if (!defaultValue) {
    throw new Error(param ? `missing parameter: ${param}` : `missing parameter`);
  }
  return defaultValue;
};

/** Class representing a test runner */
module.exports = class Runner {
  /**
   * Create a test runner
   * @param {string} [dir = '/test/[type]'] - Path to functional tests directory
   */
  constructor(dir = required('dir in Runner()', path.join(process.cwd(), 'test'))) {
    this.dir = dir;
  }

  /**
   * Run tests by type
   * @param {string} type - Type of tests, could be func or load
   * @param {string} config - Type of tests, could be func or load
   * @param {boolean} isParallel - Flag for running tests in parallel mode
   */
  // @todo Implement support for load testing
  async run(type = DEFAULT_TYPE, config = path.resolve(__dirname, '../config/artillery'), isParallel = false) {
    // config.set('type',type);
    this.type = type;
    //@todo get and run functions should be different for load tests
    //fint ushami
    //@todo make appropriate getting type, not via process.env.type!
    process.env.type = type;
    const _config = require(path.resolve(process.cwd(), config));

    const {get, run} = require(`./types/${type}`);
    const testsFiles = await this._getTestsFiles(type);
    let tests = await get(testsFiles);


    let pathToSaveFile = null;//@todo this is for artillery configuration()! delete it further
    let pathToExecuteLoad = null;//@todo fix this!
    if (type === 'load') {
      //add tests http flow to scenarios:
      const scenarios = (new artillery.Scenario(tests)).get();
      artillery.Artillery.setConfiguration(_config);
      //create artillery final configuration
      artillery.Artillery.changeTarget('http://localhost:3000').addScenarioSection(scenarios);
      tests = artillery.Artillery.get();
      pathToSaveFile = path.resolve(path.join(process.cwd(), 'artillery_report'));
      pathToExecuteLoad = path.join(process.cwd(), './artilleryConfigFinal.json');

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

  /**
   * Get tests files
   * @param {string} type - Tests' type, func | load
   * @returns {string[]} Array of tests paths
   * @private
   */
  async _getTestsFiles(type) {
    return await recursive(path.join(this.dir, type));

    // @todo Make sorts
    // @todo Make filtration
  }
};
