let expect = require('chai').expect;

let App = require('../src/App');

describe('App', function () {
  it('creates with correct cfg', function () {
    let app = () => ( new App('test', {}) );

    expect(app).to.not.throw();
  });

  it('should throw an error', function () {
    let app1 = () => ( new App() );
    let app2 = () => ( new App('test') );

    expect(app1).to.throw();
    expect(app2).to.throw();
  });

  describe('#declare()', function () {
    let app;
    beforeEach(function () {
      app = new App('test', {});
    });

    it('should create Resource', function () {
      app.declare({
        url: '/test/path'
      });

      expect(app['/test/path']).to.exist;
    });

    it('should create Resource with alias', function () {
      app.declare({
        url: '/test/path',
        alias: 'test'
      });

      expect(app['/test/path']).to.not.exist;
      expect(app['test']).to.exist;
    });
  });
});
