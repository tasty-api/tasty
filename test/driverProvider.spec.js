const { describe, it } = require('mocha');
const { expect } = require('chai');

const DriverProvider = require('../src/DriverProvider');
const mochaDriver = require('../src/drivers/func/mocha');
const artilleryDriver = require('../src/drivers/load/artillery');

describe('Driver Provider', function () {
  describe('#resolve', function () {
    it('should resolve path to the required func driver', function () {
      DriverProvider.setRunType('func');
      const resolved = DriverProvider.resolve();

      expect(resolved).to.be.equal(mochaDriver);
    });

    it('should resolve path to the required load driver', function () {
      DriverProvider.setRunType('load');
      const resolved = DriverProvider.resolve();

      expect(resolved).to.be.equal(artilleryDriver);
    });
  });

  describe('#setRunType', function () {
    it('should set passed run type', function () {
      const runType = 'func';

      DriverProvider.setRunType(runType);
      expect(DriverProvider.runType).to.be.equal(runType);
    });
  });

  describe('#setDrivers', function () {
    it('should set passed drivers', function () {
      const drivers = {
        func: 'jest',
        load: 'gatling'
      };

      DriverProvider.setDrivers(drivers);
      expect(DriverProvider.drivers).to.be.equal(drivers);
    });
  });
});
