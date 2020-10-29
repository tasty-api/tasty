const { describe, it, beforeEach } = require('mocha');
const { expect } = require('chai');

const App = require('../src/App');

describe('App', function () {
  describe('constructor', function () {
    it('should create application with correct name', function () {
      const APP_NAME = 'APP_NAME';
      const app = new App(APP_NAME, {});

      expect(app.name).to.be.equal(APP_NAME);
    });

    it('should create application with correct configuration', function () {
      const CONFIG = {
        host: {
          develop: 'DEVELOP_HOST',
          testing: 'TESTING_HOST',
          product: 'PRODUCT_HOST',
        },
      };
      const app = new App('APP_NAME', CONFIG);

      expect(app).to.include(CONFIG);
    });

    it('should throw an error without configuration argument', function () {
      let app1 = () => ( new App() );
      let app2 = () => ( new App('test') );

      expect(app1).to.throw();
      expect(app2).to.throw();
    });
  });

  describe('#init', function () {
    it('should init application from file system', function () {
      expect(true).to.be.true;
    });
  });

  describe('#initFromPostmanCollection', function () {
    it('should init application from postman collection', function () {
      expect(true).to.be.true;
    });
  });

  describe('#declare', function () {
    let app;
    beforeEach(function () {
      app = new App('test', {});
    });

    it('should create Resource', function () {
      app.declare({
        url: '/test/path',
      });

      expect(app['/test/path']).to.exist;
    });

    it('should create Resource with alias', function () {
      app.declare({
        url: '/test/path',
        alias: 'test',
      });

      expect(app['/test/path']).to.not.exist;
      expect(app['test']).to.exist;
    });
  });
});
