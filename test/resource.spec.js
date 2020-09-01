let expect = require('chai').expect;

const Resource = require('../src/Resource');

const mockApp = {
  host: {
    develop: 'www.host.org',
  },
};

describe('Check _getRequestCb method', () => {
  describe('Check request object with content-type=application/json header', () => {
    const resource = new Resource({
      url: 'testing',
      method: ['get', 'post'],
      headers: {
        'content-type': 'application/json',
      },
    }, mockApp);
    const requestBuilder = resource._getRequestCb({
      method: 'get',
      opts: {
        body: {
          id: '${id}',
          name: '${name}',
          surname: 'auto',
        },
      },
      cache: {},
    });

    it('Should build correct request object for application/json content type requests with values from context', () => {
      const requestObj = requestBuilder({
        id: '12345',
        name: 'test',
      });

      expect(requestObj.body).to.deep.equal({
        id: '12345',
        name: 'test',
        surname: 'auto',
      });
    });

    it( 'Should save context values type during evaluation of request object', () => {
      const requestObj = requestBuilder({
        id: 12345,
        name: 'test',
      });

      expect(requestObj.body).to.deep.equal({
        id: 12345,
        name: 'test',
        surname: 'auto',
      });
    });

    it('Should eval array body correctly', () => {
      const requestBuilder = resource._getRequestCb({
        method: 'get',
        opts: {
          body: [{
            id: 12345,
            name: '${name}',
            surname: 'surname',
          }],
        },
        cache: {},
      });
      const requestObj = requestBuilder({
        name: 'Test',
      });

      expect(requestObj.body).to.deep.equal([{
        id: 12345,
        name: 'Test',
        surname: 'surname',
      }]);
    });
  });

  it('Shouldn\'t eval request object if content type other then application/json', () => {
    const resource = new Resource({
      url: 'testing',
      method: ['get', 'post'],
    }, mockApp);
    const requestBuilder = resource._getRequestCb({
      method: 'get',
      opts: {
        body: {
          id: '${id}',
          name: '${name}',
          surname: 'auto',
        },
      },
      cache: {},
    });
    const requestObj = requestBuilder({
      id: 12345,
      name: 'test',
    });

    expect(requestObj.body).to.deep.equal({
      id: '${id}',
      name: '${name}',
      surname: 'auto',
    });
  });
});
