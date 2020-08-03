const { describe, it } = require('mocha');
const chai = require('chai'), spies = require('chai-spies');
chai.use(spies);
const expect = chai.expect;
const path = require('path');
const requireDir = require('require-dir');

const Services = require('../src/Services');

describe('Services', function () {
  describe('#init', function () {
    it('should require directory', function () {
      const servicePath = path.join(process.cwd(), 'test', 'assets', 'services');
      const services = new Services();
      const spyFunc = chai.spy(requireDir);

      chai.spy.on(services, 'init', spyFunc);
      services.init(servicePath);

      expect(spyFunc).to.have.been.called.with.exactly(servicePath);
    });
  });

  describe('#register', function () {
    it('should set new service instance', function () {
      const services = new Services();
      services.register('Jaeger', {
        host: {
          debug: 'http://localhost:16686'
        },
      });

      expect(services.Jaeger.host.debug).to.be.equal('http://localhost:16686');
    });
  });
});
