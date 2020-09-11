const assert = require('chai').assert;
const utils = require('../libs/utils');
const _ = require('lodash');
const config = require('../config');
const driverProvider = require('./DriverProvider');
const Ajv = require('ajv');
const ReqDrvStructProcessor = require('./SyncConveyor');
const deepmerge = require('deepmerge');

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

    if (app.trace && app.trace[config.get('env')])
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

    if (jsonSchema.isJoi) {
      const error = jsonSchema.validate(res.data).error;

      assert.isTrue(error === null, error && error.message);
    } else {
      const ajv = new Ajv({ schemaId: 'auto' });
      ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

      const validate = ajv.validate(jsonSchema, res.data);

      assert.isTrue(validate, ajv.errorsText());
    }

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
      fn(_.get(this, 'res.data'), ctx),
      true,
      `${fn.toString()} returns false, expected to be true`
    );
  }


  _getRequestCb({ method, opts, cache } = {
    method: requiredParam('method'),
    opts: requiredParam('opts'),
    cache: requiredParam('cache')
  }) {

    // middleware conveyor
    const requestStructConv = new ReqDrvStructProcessor({ method });

    const middlewareResource = {
      resource: this, // resource instance (mainly set in declaration block)
      cache, // cache (populated by calling setHeaders(), setBody(), etc. methods)
      opts, // options from test: initiated call of app['<alias>'].<verb>({<options_are_defined_here>})
    };

    const urlMw = () => (function (middlewareResources, context, next) {
      const { resource, opts } = middlewareResources;
      //"this" now stores all the data that has been collected inside the conveyor before current middleware
      this.url = `${resource.app.host[config.get('env')]}/${resource.url}${utils.evalTpl(opts.path, context)}`;

      next();
    });

    const headersMw = () => (function (middlewareResources, context, next) {
      const { resource, cache, opts } = middlewareResources;

      this.headers = _.assign(
        {},
        resource.headers, // do not eval headers which has been set in declaration block
        utils.evalObj(cache.headers, context),
        utils.evalObj(opts.headers, context)
      );

      next();
    });

    const paramsMw = () => (function (middlewareResources, context, next) {
      const { resource, cache, opts } = middlewareResources;

      this.params = _.assign(
        {},
        resource.params, //  do not eval params which has been set in declaration block
        utils.evalObj(cache.params, context),
        utils.evalObj(opts.params, context)
      );

      next();
    });

    const bodyMw = () => (function (middlewareResources, context, next) {
      const { resource, cache, opts } = middlewareResources;

      // TODO make decision: headers are case-sensitive or case insensitive
      // TODO be careful with headers like Authorization: they may not be accepted by the designed API if passed in lowercase

      const contentType = this.headers['content-type'] || this.headers['Content-Type'];

      switch (true) {
        case /^(application\/json).*/.test(contentType):
          this.body = bodyProcessor['application/json']({ resource, cache, opts, context });
          break;
        default:
          this.body = opts.body || cache.body || resource.body;
          break;
      }

      next();
    });

    const formDataMw = () => (function (middlewareResources, context, next) {
      this.formData = middlewareResources.opts.formData;

      next();
    });

    //body processor - structure that processes the body inside the middleware
    const bodyProcessor = {
      'application/json': function ({ resource, cache, opts, context }) {
        return deepmerge(
          deepmerge(
            resource.body, // we do not eval body in declaration block
            utils.evalObj(cache.body, context), // eval body that has been set in setBody() method if it has been initiated
          ),
          utils.evalObj(opts.body, context), // eval body that has been set directly inside get() or post(), etc
        );
      },
    };

    return (context) => {

      requestStructConv.use(urlMw());
      /**it is very important to use defined sequence of middlewares!**/
      requestStructConv.use(headersMw());// !use headers middleware before body middleware, because, in the body middleware there is header checking
      requestStructConv.use(paramsMw());
      requestStructConv.use(bodyMw());
      requestStructConv.use(formDataMw());

      return requestStructConv.run(middlewareResource, context);
    };
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


      return driver.request(this._getRequestCb({ method, opts, cache }), opts.mock || cache.mock || this.mock[method], opts.capture, this, { method, ...opts }, cache);
    };
  }
}

const requiredParam = (paramName) => {
  throw new Error(`parameter ${paramName} is required!`);
};
module.exports = Resource;
