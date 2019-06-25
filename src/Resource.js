const axios = require('axios');
const assert = require('chai').assert;
const jsonpath = require('jsonpath');
const { evalTpl } = require('../libs/utils');
const Joi = require('@hapi/joi');
const LOAD = 'load';
const artillery = require('./types/load/artillery');

/** Class representing a resource */
class Resource {
  /**
   * Create a resource
   * @param {object} opts - Resource's options
   * @property {string} opts.url - Resource's url
   * @property {string[]} [opts.methods = ["get"]] - Set of available resource's methods
   * @property {string} [opts.alias] - Short name for resource
   * @property {object} [opts.headers = {}] - Default headers for resource, which will be used by default while sending
   * request
   * @property {object} [opts.params = {}] - Default query parameters for resource, which will be used by default while
   * sending request
   * @property {object} [opts.body = {}] - Default body for resource, which will be used by default while sending
   * request
   * @property {object} [opts.mock = {}] - Default mock response, which will be used by default while sending request
   * @property {object} [opts[get|head|post|put|delete|connect|options|trace|patch]] - Mock object
   * @todo Maybe additional separation by environment makes sense here [develop|testing|product]
   * @todo:
   *  - @property {object} [opts.schemas] - JSON schemas of responses by status
   *  @property {object} [opts.schemas[get|head|post|put|delete|connect|options|trace|patch]] - Schema for response
   * @todo Maybe additional separation by environment makes sense here [develop|testing|product]
   * @param {App} app - An application instance
   */
  constructor(opts, app) {
    const { url, methods = ['get'], headers = {}, params = {}, body = {}, mock = {}, schemas = {} } = opts;

    this.app = app;
    this.url = url;
    this.headers = headers;
    this.params = params;
    this.body = body;
    this.mock = mock;
    this.schemas = schemas;
    this.cache = {};

    methods.forEach(method => {
      this[method] = this._create(method);

    });
  }

  /**
   * Set temporary headers for request
   * @param {object} headers - Headers for request
   * @returns {Resource} A Resource object
   */
  setHeaders(headers) {
    this.cache = {
      ...(this.cache || {}),
      headers,
    };

    return this;
  }

  /**
   * Get full headers for request
   * @returns {object} A headers object
   */
  getHeaders(headers, runCache) {
    return {
      ...this.headers,
      ...runCache,
      ...headers,
    };
  }

  /**
   * Set temporary query parameters for request
   * @param {object} params - Query parameters for request
   * @returns {Resource} A Resource object
   */
  setParams(params) {
    this.cache = {
      ...(this.cache || {}),
      params,
    };

    return this;
  }

  /**
   * Get full query parameters for request
   * @returns {object} A query parameters object
   */
  getParams(params) {
    return {
      ...this.params,
      ...this.cache.params,
      ...params,
    };
  }

  /**
   * Set temporary body for request
   * @param {object} body - Body for request
   * @returns {Resource} A Resource object
   */
  setBody(body) {
    this.cache = {
      ...(this.cache || {}),
      ...body,
    };

    return this;
  }

  /**
   * Get full body for request
   * @returns {object} A body object
   */
  getBody(body, runCache) {
    return {
      ...this.body,
      ...runCache,
      ...body,
    };
  }

  /**
   * Mock response with object
   * @param {object} mock - A mock object
   * @returns {Resource} A Resource object
   */
  setMock(mock) {
    this.cache = {
      ...(this.cache || {}),
      mock,
    };

    return this;
  }

  /**
   * Get mock for response
   * @param method
   * @param mock
   * @returns {object} A mock object
   */
  getMock(method, mock) {
    return mock || this.cache.mock || this.mock[method];
  }

  /**
   * @todo JSDoc
   * @param {string} name
   */
  getSchema(name) {
    // @todo add check
    return this.schemas[name];
  }

  /**
   * Check response status
   * @param {(number|string)} expected - Expected status value
   */
  checkStatus(expected) {
    const { res: { status: actual } } = this;

    assert.equal(actual, +expected, `Response status should be equal to ${+expected}. ${actual} was received.`);
  }

  /**
   * Check response status text
   * @param {string} expected - Expected statusText value
   */
  checkStatusText(expected) {
    const { res: { statusText: actual } } = this;

    assert.equal(actual, expected, `Response statusText should be equal to ${expected}. ${actual} was received`);
  }

  /**
   * Check response body by schema
   */
  checkStructure(jsonSchema) {
    const { res } = this;
    const { error } = Joi.validate(res.data, jsonSchema);

    assert.isTrue(error === null, error && error.message);
  }

  /**
   * Check response headers
   * @param {object} expected - Expected headers object
   */
  checkHeaders(expected) {
    // @todo implement checking of headers
  }

  /**
   * Check response message
   * @param {string} expected - Expected message value
   */
  checkMessage(expected) {
    // @todo implement checking of message
  }

  /**
   * Check response by custom checking function
   * @param {function} fn - Custom checking function
   * @param {object} ctx - Execution context
   */
  check(fn, ctx) {
    return assert.equal(
      fn(this.res.data, ctx),
      true,
      `${fn.toString()} returns false, expected to be true`
    );
  }

  /**
   * Create method for Resource
   * @param {string} method - Method name for registration in Resource
   * @returns {function(*=): function(*=): Resource}
   * @private
   */
  _create(method) {
    return (opts = {}) => {
      if (process.env.type === LOAD) {
        const struct = {
          capture: opts.capture,
          path: opts.path ? this.url + opts.path : this.url,
          headers: this.getHeaders(opts.headers),
          params: this.getParams(opts.params),
          body: this.getBody(opts.body)
        };

        return (new artillery.SingleRequest({ method, ...struct })).get();
      } else {
        const self = this;
        const cache = JSON.parse(JSON.stringify(self.cache));
        self.cache = {};

        return async function request(context = {}) {
          // const { capture, mock } = opts; // @todo Handle all options with evalTpl
          const capture = opts.capture;
          const mock = opts.mock;

          self.res = self.getMock(method, mock, cache)
            ? self._mockResponse(opts)
            : await self._realResponse(
              method,
              opts, context, cache);

          self.snapshot = captureData(capture, self.res);

          return self;
        };
      }
    };
  }

  _mockResponse(opts) {
    const { mock, headers } = opts;

    return {
      headers: this.getHeaders(headers),
      data: this.getMock(method, mock),
      // @todo Provide status, statusText, message, body data from mock object
    };
  }

  async _realResponse(method, opts, context, cache) {
    const { path, body, headers } = opts;
    const pathParam = !!path && evalTpl(path, context);

    let res;
    try {
      res = await axios({
        url: `${this.app.host.develop}/${this.url}${pathParam || ''}`,
        method,
        headers: this.getHeaders(headers, cache),
        data: this.getBody(evalBody(body, context), cache),
      });
    } catch (err) {
      res = err.response;
    }
    return res;
  }
}

/**
 * @function captureData - Capture data from response to context
 * @param capture
 * @param requestData
 * @returns {object|object[]} - Captured data from response
 */
function captureData(capture, requestData) {
  if (!capture) return {};

  if (Array.isArray(capture)) {
    return capture.reduce((accruedData, { json, as }) => ({
      ...accruedData,
      [as]: getValue(json, requestData),
    }), {});
  }

  const { as, json } = capture;

  return {
    [as]: getValue(json, requestData),
  };
}

/**
 * @function getValue - Get value from object by JsonPath
 * @param jsonPath
 * @param obj
 * @returns {*}
 */
function getValue(jsonPath, obj) {
  const rootObj = jsonPath.startsWith('#')
    ? obj.headers
    : obj.data;

  return jsonpath.value(rootObj, jsonPath.replace(/^#/, '$'));
}

function evalBody(body = {}, context) {
  const res = {};

  Object.keys(body).forEach(key => {
    res[key] = evalTpl(body[key], context);
  });

  return res;
}

module.exports = Resource;
