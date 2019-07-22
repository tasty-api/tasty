const fs = require('fs');
const path = require('path');
const recursive = require('recursive-readdir');
const Readable = require('stream').Readable;
const _ = require('lodash');
const driverProvider = require('./DriverProvider');
const config = require('../config');
const mkdirp = require('mkdirp');
const { promisify } = require('util');
const { resetCache } = require('./utils');

const writeFilePromisified = promisify(fs.writeFile);
const mkdirpPromisified = promisify(mkdirp);
const readdirPromisified = promisify(fs.readdir);

const DEFAULT_TYPE = 'func';

//require all the schemas and validation methods for all types of configs: func and load, etc...
const configDriverFolders = fs.readdirSync(path.join(__dirname, '..', 'config', 'drivers'));
const configDrivers = configDriverFolders.reduce((acc, item) => {
  const pathOfTheItem = path.resolve(path.join(__dirname, '..', 'config', 'drivers', item));
  if (fs.lstatSync(pathOfTheItem).isDirectory()) {
    acc[item] = require(pathOfTheItem);
  }
  return acc;
}, {});

/** Class representing a test runner */
class Runner {
  /**
   * Create a test runner
   * @param {string} [dir = '/test/[type]'] - Path to functional tests directory
   * @param {string} funcCfg - Path to functional tests configuration file
   * @param {string} loadCfg - Path to load tests configuration file
   */
  constructor(dir = path.join(process.cwd(), 'test'), funcCfg = path.join(process.cwd(), 'config', '.mocharc.js'), loadCfg = path.join(process.cwd(), 'config', '.artilleryrc.js')) {
    this.func = {
      dir: path.join(dir, 'func'),
    };
    this.load = {
      dir: path.join(dir, 'load'),
    };

    this.logStream = new Readable({
      read: () => {
      },
    });
    this.configDir = path.join(process.cwd(), 'config');
    this.flagsChannelConfigs = {
      func: false,
      load: false
    };//flags showing if the channel configs are set, not the core congigs from Tasty

    this.flagsChannelConfigs['func'] = fs.existsSync(funcCfg);//config for functional tests - inside the channel or not
    this.flagsChannelConfigs['load'] = fs.existsSync(funcCfg);//config for load tests - inside the channel or not

    config.set('func_cfg', fs.existsSync(funcCfg) ? funcCfg : path.join(__dirname, '..', 'config', '.mocharc.js'));
    config.set('load_cfg', fs.existsSync(loadCfg) ? loadCfg : path.join(__dirname, '..', 'config', '.artilleryrc.js'));

    driverProvider.setDrivers({func: 'mocha', load: 'artillery'});
  };

  getFileNameForType(type) {
    switch (type) {
      case 'func':
        return '.mocharc.js';
      case 'load':
        return '.artilleryrc.js';
      default:
        break;
    }
  };

  /**
   * Run tests by type
   * @param {string} type - Type of tests, could be func or load
   * @param {boolean} isParallel - Flag for running tests in parallel mode
   */
  async run(type = DEFAULT_TYPE, isParallel = false) {
    this.type = type;
    driverProvider.setRunType(type);

    const driver = driverProvider.resolve();
    const testsFiles = await this._getTestsFiles(type);
    const tests = driver.get(testsFiles);

    this.status = 'inProcess';

    const stats = await driver.run(tests, isParallel, this.logStream);

    this.status = 'inPending';

    return stats;
  }

  getCurrentType() {

    return this.type;
  }

  getCurrentConfig(type) {
    const configFilePath = config.get(type + '_cfg');
    try {
      resetCache(configFilePath);
      return require(configFilePath);
    } catch (err) {
      return null;
    }
  };

  validate(type, data) {
    //get the appropriate validator for the data
    const result = configDrivers[type].validate(data);
    return result;
  }

  /**
   * sets the current configuration and saves it to file
   * @param type
   * @param data
   * @returns {Promise<never>}
   */
  async setCurrentConfig(type, data) {
    // watch: if the config is from the channel(not to erase default config)
    if (typeof data === "object") {
      if (!this.flagsChannelConfigs[type]) {
        //if no config in channel - create it

        try {
          //try to read configuration directory
          await readdirPromisified(this.configDir);
        } catch (err) {
          if (err.code === 'ENOENT') {
            //create directory
            await mkdirpPromisified(this.configDir);
          } else {
            throw new Error('Error while searching the directory: ' + err);
          }
        }
      }
      // if we already have local configuration inside the channel application - just use it to save incoming data
      const result = this.validate(type, data);
      if (result.validationResult) {
        const textToSave = 'module.exports = ' + JSON.stringify(data, null, 2);
        try {
          const filePathFinal = path.resolve(path.join(this.configDir, this.getFileNameForType(type)));
          const writeResult = writeFilePromisified(filePathFinal, textToSave);
          //set the config for current execution:
          config.set(type+'_cfg',filePathFinal);
        }
        catch(error)
        {
          throw new Error('Error while writing the file of configuration: '+filePathFinal);
        }
      } else {
        throw new Error(result.validationErrors);
      }
    } else {
      throw new Error('The input object does not have valid JSON structure!');
    }
  };

  // @todo implement filtration
  setFilters(filters) {
    this.filters = filters;
  }

  getStatus() {
    return this.status;
  }
  getSchema(type){
    return configDrivers[type].getSchema();
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

    if (!tests.length) return files;

    return _.filter(files, file => _.includes(tests, file));
    // @todo Make sorts
    // @todo Make filtration
  }
}

module.exports = Runner;
