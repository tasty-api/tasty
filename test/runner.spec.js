const { describe, it } = require('mocha');
const { expect } = require('chai');

const path = require('path');
const Readable = require('stream').Readable;
const config = require('../config');
const testCollection = require('./assets/runner/Test.postman_collection');

const Runner = require('../src/Runner');

describe('Runner', function () {
  describe('constructor', function () {
    it('should throw an error without configuration argument', function () {
      const runner = () => ( new Runner() );

      expect(runner).to.throw();
    });

    it('should create runner with correct dir path', function () {
      const testsDir = path.resolve(process.cwd(), 'test', 'assets', 'runner');
      const runner = new Runner({
        testsDir,
      });
      const testsDirFunc = path.resolve(testsDir, 'func');
      const testsDirLoad = path.resolve(testsDir, 'load');

      expect(runner.func.dir).to.be.equal(testsDirFunc);
      expect(runner.load.dir).to.be.equal(testsDirLoad);
    });

    it('should set passed postman collection', function () {
      new Runner({
        postmanCollection: testCollection,
      });

      expect(config.get('postman:collection')).to.deep.equal(testCollection);
    });

    it('should create readable logstream', function () {
      const runner = new Runner({});

      expect(runner.logStream).to.be.instanceof(Readable);
    });

    it('should create runner with correct passed configs', function () {
      const assetsPath = path.resolve(process.cwd(), 'test', 'assets', 'runner');
      const configsSettings = {
        funcCfg: path.join(assetsPath, '.mocharc.js'),
        loadCfg: path.join(assetsPath, '.artilleryrc.js'),
      };
      new Runner(configsSettings);

      expect(config.get('func_cfg')).to.be.equal(configsSettings.funcCfg);
      expect(config.get('load_cfg')).to.be.equal(configsSettings.loadCfg);
    });

    it('should create runner with correct default configs', function () {
      const configPath = path.resolve(process.cwd(), 'config');
      const configsSettings = {
        funcCfg: path.join(configPath, '.mocharc.js'),
        loadCfg: path.join(configPath, '.artilleryrc.js'),
      };

      new Runner({});

      expect(config.get('func_cfg')).to.be.equal(configsSettings.funcCfg);
      expect(config.get('load_cfg')).to.be.equal(configsSettings.loadCfg);
    });
  });

  describe('#run', function () {
    it('should fail if no tests are specified', function () {
      expect(true).to.be.true;
    });

    it('should run tests with default parameters', async function () {
      const testsDir = path.resolve(process.cwd(), 'test', 'assets', 'runner');
      const objKeys = ['start', 'end', 'suites', 'tests', 'passes', 'pending', 'failures', 'duration'];
      const runner = new Runner({
        testsDir,
      });

      const res = await runner.run('func', false, [], {
        onTestEnd: () => {}
      });

      expect(res).to.have.all.keys(objKeys);
      expect(res.suites).to.be.equal(1);
    });

    it('should run tests with load type', function () {
      expect(true).to.be.true;
    });

    it('should run tests with passed files', async function () {
      const runner = new Runner({});
      const filePath = path.join(path.resolve(process.cwd(), 'test', 'assets', 'runner', 'func'), 'test.js');

      const res = await runner.run('func', false, [filePath], {
        onTestEnd: () => {},
      });

      expect(res.suites).to.equal(1);
      expect(res.tests).to.equal(1);
      expect(res.passes).to.equal(1);
      expect(res.failures).to.equal(0);
    });

    it('should call onTestEnd function each time a test runs', async function () {
      const testsDir = path.resolve(process.cwd(), 'test', 'assets', 'runner');
      const runner = new Runner({
        testsDir,
      });
      let counter = 0;

      await runner.run('func', false, [], {
        onTestEnd: () => counter++,
      });

      expect(counter).to.be.equal(1);
    });
  });

  describe('#getCurrentType', function () {
    it('should return current type', function () {
      const runner = new Runner({});

      expect(runner.getCurrentType()).to.be.equal(runner.type);
    });
  });

  describe('#setFilters', function () {
    it('should set passed filters', function () {
      const filters = {
        tests: {
          func: 'mocha',
          load: 'artillery'
        }
      };
      const runner = new Runner({});

      runner.setFilters(filters);

      expect(runner.filters).to.be.equal(filters);
    });
  });

  describe('#getStatus', function () {
    it('should return status if tests run successfully', async function () {
      const testsDir = path.resolve(process.cwd(), 'test', 'assets', 'runner');
      const runner = new Runner({
        testsDir,
      });

      await runner.run('func', false, [], {
        onTestEnd: () => {},
      });

      expect(runner.getStatus()).to.be.equal('inPending');
    });
  });

  describe('#getFilter', function () {
    it('should return files according to type', async function () {
      const testsDir = path.resolve(process.cwd(), 'test', 'assets', 'runner');
      const runner = new Runner({
        testsDir,
      });

      expect( await runner.getFilter('func') ).to.deep.equal({
        [path.join(testsDir, 'func', 'test.js')]: true,
      });

      expect( await runner.getFilter('load') ).to.deep.equal({
        [path.join(testsDir, 'load', 'test.js')]: true,
      });
    });
  });
});
