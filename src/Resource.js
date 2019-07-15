const assert = require('chai').assert;
const utils = require('../libs/utils');
const Joi = require('@hapi/joi');
const _ = require('lodash');
const config = require('../config');
const driverProvider = require('./DriverProvider');

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
    this.capturedData = {};

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
   * @todo JSDoc
   * @param {string} name
   */
  getSchema(name) {
    // @todo add check
    return this.schemas[name];
  }

  getTraceLink(uid) {
    const app = this.app;

    if (app.trace)
      return encodeURI(`${app.trace[config.get('env')]}/search?service=${app.name}&tags={"x-request-id":"${uid}"}`);

    return null;
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
      const cache = _.assign({}, this.cache);
      const driver = driverProvider.resolve();

      this.cache = {};

      return driver.request(context => ({
        method,
        url: `${this.app.host[config.get('env')]}/${this.url}${utils.evalTpl(opts.path, context)}`,
        headers: _.assign({}, this.headers, cache.headers, utils.evalObj(opts.headers, context)),
        params: _.assign({}, this.params, cache.params, utils.evalObj(opts.params, context)),
        body: _.assign({}, this.body, cache.body, utils.evalObj(opts.body, context)),
      }), opts.mock || cache.mock || this.mock[method], opts.capture, this, { method, ...opts }, cache);
    };
  }
}

module.exports = Resource;
