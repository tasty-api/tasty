const axios = require('axios');
const log = require('../libs/log')(module);
const jsonpath = require('jsonpath');
const assert = require('chai').assert;

module.exports = class Resource {
  constructor(options, app) {
    const { headers = {}, params = {}, methods = ['get'], body = null, url, mock = {} } = options;

    this.app = app;
    this.url = url;
    this.headers = headers
    this.params = params
    this.cache = {};

    methods.forEach(method => this[method] = this.create(method, mock[method]));

    if (methods.includes('post')) {
      this.setBody = body => {
        log.info('Set body');

        this.cache = {
          ...(this.cache || {}),
          body,
        };

        return this;
      };
    } else if (body) {
      // console.log(body);
      console.warn('Body is used only with POST or PUT methods');
    }
  }

  setHeaders(headers) {
    log.info('Set headers');

    this.cache = {
      ...(this.cache || {}),
      headers,
    };

    return this;
  }

  setParams(params) {
    log.info('Set params');

    this.cache = {
      ...(this.cache || {}),
      params,
    }

    return this;
  }

  create(method, mock) {
    return (opts = {}) => {
      const { capture, path } = opts;
      // log.info(`push ${method} to stack`);
      const that = this;

      if (mock) {
        return async function mockRequest() {
          log.info(`send mock ${method}`);
          that.res = {
            data: mock,
          };

          return {
            res: that,
            context: {
              ...(capture ? {[capture.as]: jsonpath.value(mock, capture.json)} : {}),
            }
          }
        }
      }

      return async function request(context = {}) {
        log.info(`send ${method}`);
        const pathParam = !!path && evaluate('`' + path + '`', context);

        // this.url = pathParam ? this.url + pathParam : this.url;

        const res = await axios({
          url: `${that.app.host.develop}/${that.url}${pathParam || ''}`,
          method,
          headers: {
            ...that.headers,
            ...that.cache.headers,
          },
        });

        that.res = res;

        that.cache = {};

        return {
          res: that,
          context: {
            ...(capture ? {[capture.as]: jsonpath.value(res.data, capture.json)} : {}),
          },
        };
      };
    };
  }

  checkStatus(expected) {
    const { res: { status: actual } } = this;

    assert.equal(actual, expected, `Response status should be equal to ${expected}. ${actual} was received.`);
  }

  checkStructure() {
    // console.log('structure');
    return this;
  }

  checkMessage(message) {
    // console.log(message);
    return this;
  }

  checkStatusText(expected) {
    const { res: { statusText: actual } } = this;

    assert.equal(actual, expected, `Response statusText should be equal to ${expected}. ${actual} was received`);
  }

  checkHeader(header) {
    // console.log(header);
    return this;
  }

  check(condition) {
    return assert.equal(condition(this.res.data), true, `${condition.toString()} returns false, expected to be true`);
  }
};

function evaluate(code, context = {}) {
  const func = new Function(`with(this) { return ${code} }`);

  return func.call(context);
}
