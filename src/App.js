const path = require('path');
const requireDir = require('require-dir');
const log = require('../libs/log')(module);
const Resource = require('./Resource');

/** Class representing an application */
module.exports = class App {
  /**
   * Create an application
   * @param {string} name - Application name
   * @param {object} cfg - Application configuration
   * @property {object} cfg.host - Hosts' list by environment
   * @property {string} cfg.host.develop - Host for development environment
   * @property {string} cfg.host.testing - Host for testing environment
   * @property {string} cfg.host.product - Host for production environment
   */
  constructor(name, cfg) {
    this.name = name;

    Object.keys(cfg).forEach(opt => this[opt] = cfg[opt]);
  }

  /**
   * Initialize an application
   * @param {string} [srcDir = '/app'] - Path to application directory
   */
  init(srcDir = path.join(process.cwd(), 'app')) {
    /**
     * @todo Implement opportunity to initialize application from:
     *  - postman config file
     *  - definitions directory
     */
    requireDir(srcDir, {
      recurse: true,
    });
  }

  /**
   * Declare an application resource
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
   */
  declare(opts) {
    const { url, alias } = opts;

    this[alias || url] = new Resource(opts, this);
  }
};
