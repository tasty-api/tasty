const { describe, it } = require('mocha');
const { expect } = require('chai');

const Service = require('../src/Service');
const DriverProvider = require('../src/DriverProvider');

describe('Service', function () {
  describe('constructor', function () {
    it('should set host from passed options', function () {
      const host = {
        develop: 'http://develop',
        testing: 'http://testing',
        product: 'http://product'
      };
      const service = new Service({
        host,
      });

      expect(service.host).to.be.equal(host);
      expect(service.headers).to.deep.equal({});
    });

    it('should set headers from passed options', function () {
      const headers = {
        develop: 'header1',
        testing: 'header2',
        product: 'header3'
      };
      const service = new Service({
        headers,
      });

      expect(service.headers).to.be.equal(headers);
    });
  });

  describe('#send', function () {
    it('should return methods', function () {
      DriverProvider.runType = 'func';
      const service = new Service({
        host: {
          develop: 'http://develop',
          testing: 'http://testing',
          product: 'http://product'
        },
        headers: {
          develop: 'header1',
          testing: 'header2',
          product: 'header3'
        }
      });

      const res = service.send({});
      expect(Object.keys(res)).to.deep.equal(['getTraceLink', 'send']);
    });
  });
});
