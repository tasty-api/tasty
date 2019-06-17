const axios = require('axios');
const jsonpath = require('jsonpath');
const { evalTpl } = require('../libs/utils');

const Resource = require('./Resource');

/** Class representing external service */
class Service extends Resource {
  /**
   * Create external service
   * @param {object} opts - Options for service
   * @prop {object} opts.host - Hosts' list by environment
   * @property {string} opts.host.develop - Host for development environment
   * @property {string} opts.host.testing - Host for testing environment
   * @property {string} opts.host.product - Host for production environment
   * @property {object} opts.headers - Headers' list by environment
   * @property {string} opts.headers.develop - Headers for development environment
   * @property {string} opts.headers.testing - Headers for testing environment
   * @property {string} opts.headers.product - Headers for production environment
   */
  constructor(opts) {
    super(opts);

    this.host = opts.host;
    this.headers = opts.headers.develop; // @todo Define env from NODE_ENV
    this.cache = {};
    this.res = null;
    this.snapshot = null;
  }

  /**
   * Send request to service
   * @param {object} opts - Request options
   */
  send(opts) {
    const self = this;

    return async function request(context = {}) {
      const { capture, method, path, headers, params, body, mock } = opts; // @todo Handle all options with evalTpl
      const pathParam = !!path && evalTpl(path, context);

      self.res = self.getMock(method, mock)
        ? {
          headers: self.getHeaders(headers),
          data: self.getMock(method, mock),
          // @todo Provide status, statusText, message, body data from mock object
        }
        : await axios({
          url: `${self.host.develop}${pathParam || ''}`, // @todo Define env from NODE_ENV
          method,
          headers: self.getHeaders(headers),
        });
      self.cache = {};
      self.snapshot = captureData(capture, self.res);

      return self;
    };
  }
}

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

function getValue(jsonPath, obj) {
  const rootObj = jsonPath.startsWith('#')
    ? obj.headers
    : obj.data;

  return jsonpath.value(rootObj, jsonPath.replace(/^#/, '$'));
}

module.exports = Service;
