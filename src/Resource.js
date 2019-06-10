const axios = require('axios');
const assert = require('chai').assert;
const jsonpath = require('jsonpath');
const Ajv = require('ajv');
const log = require('../libs/log')(module);
const {eval, evalTpl} = require('../libs/utils');
const LOAD = 'load';
const artillery = require('./types/load/artillery');

/** Class representing a resource */
module.exports = class Resource {
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
    const {url, methods = ['get'], headers = {}, params = {}, body = {}, mock = {}, schemas = {}} = opts;

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
  getHeaders(headers) {
    return {
      ...this.headers,
      ...this.cache.headers,
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
    }

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
      body,
    };

    return this;
  }

  /**
   * Get full body for request
   * @returns {object} A body object
   */
  getBody(body) {
    return {
      ...this.body,
      ...this.cache.body,
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
   * @param {string} method
   * @param {number} responseCode
   */
  getSchema(method, responseCode) {
    // @todo add check
    return this.schemas[method][responseCode];
  }

  /**
   * Check response status
   * @param {(number|string)} expected - Expected status value
   */
  checkStatus(expected) {
    const {res: {status: actual}} = this;

    assert.equal(actual, +expected, `Response status should be equal to ${+expected}. ${actual} was received.`);
  }

  /**
   * Check response status text
   * @param {string} expected - Expected statusText value
   */
  checkStatusText(expected) {
    const {res: {statusText: actual}} = this;

    assert.equal(actual, expected, `Response statusText should be equal to ${expected}. ${actual} was received`);
  }

  /**
   * Check response body by schema
   */
  checkStructure(jsonSchema) {
    const {res} = this;
    const ajv = new Ajv();
    const validate = ajv.validate(jsonSchema, res.data);

    assert.isTrue(validate, ajv.errorsText())
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
   * @returns {function(*=): function(*=): module.Resource}
   * @private
   */
  _create(method) {
    if (process.env.type === LOAD) {
      return (opts = {}) => {
        const struct = {
          capture:opts.capture,
          path: opts.path ? this.url + opts.path : this.url,
          headers: this.getHeaders(opts.headers),
          params: this.getParams(opts.params),
          body: this.getBody(opts.body)
        };

        // ...
        //create instance of single request
        return (new artillery.SingleRequest({method, ...struct})).get();
      };
    } else {
      return (opts = {}) => {
        const self = this;
        const mediumPriorityMock = this.cache.mock;

        return async function request(context = {}) {
          const {capture, path, headers, params, body, mock} = opts; // @todo Handle all options with evalTpl
          const pathParam = !!path && evalTpl(path, context);

          self.res = self.getMock(method, mock)
            ? {
              headers: self.getHeaders(headers),
              data: self.getMock(method, mock),
              // @todo Provide status, statusText, message, body data from mock object
            }
            : await axios({
              url: `${self.app.host.develop}/${self.url}${pathParam || ''}`,
              method,
              headers: self.getHeaders(headers),
            });
          self.cache = {};
          self.snapshot = captureData(capture, self.res);

          return self;
        }
      };
    }
  }
};

/**
 * @function captureData - Capture data from response to context
 * @param capture
 * @param requestData
 * @returns {object|object[]} - Captured data from response
 */
function captureData(capture, requestData) {
  if (!capture) return {};

  if (Array.isArray(capture)) {
    return capture.reduce((accruedData, {json, as}) => ({
      ...accruedData,
      [as]: getValue(json, requestData),
    }), {});
  }

  const {as, json} = capture;

  return {
    [as]: getValue(json, requestData),
  }
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
