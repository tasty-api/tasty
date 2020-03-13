const driverProvider = require('./DriverProvider');
const _ = require('lodash');
const config = require('../config');
const utils = require('../libs/utils');

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
    this.headers = opts.headers || {};
  }

  /**
   * Send request to service
   * @param {object} opts - Request options
   */
  send(opts) {
    const driver = driverProvider.resolve();

    return driver.request(context => ({
      method: opts.method,
      url: `${this.host[config.get('env')]}/${utils.evalTpl(opts.path, context)}`,
      headers: _.assign({}, this.headers[config.get('env')], utils.evalObj(opts.headers, context)),
      params: utils.evalObj(opts.params, context),
      body: utils.evalObj(opts.body, context),
    }), opts.mock, opts.capture, this);
  }
}

module.exports = Service;
