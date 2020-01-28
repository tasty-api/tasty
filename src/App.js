const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const requireDir = require('require-dir');
const log = require('../libs/log')(module);
const Resource = require('./Resource');
const config = require('../config');
const { POSTMAN_MODE, PROTOCOL_HTTP, PROTOCOL_AMQP } = require('./consts');

/** Class representing an application */
class App {
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

    config.set('hosts', cfg.host); // @todo arch: Think through this place

    this.declare = this.declare.bind(this);
  }

  /**
   * Initialize an application
   * @param {string} [srcDir = '/app'] - Path to application directory
   */
  init(srcDir = path.join(process.cwd(), 'app')) {
    try {
      requireDir(srcDir, {
        recurse: true,
      });

      const mode = config.get('mode');

      if (mode === POSTMAN_MODE) {
        const configPath = config.get('postman_options:config');

        if (_.isNull(configPath)) throw new Error('Postman collection doesn\'t specify.');

        const content = fs.readFileSync(path.resolve(configPath), { encoding: 'utf-8' });
        const collection = JSON.parse(content);

        if (_.isUndefined(_.get(collection, ['info', '_postman_id']))) throw new Error('It doesn\'t seem like a Postman collection.');

        this.initFromPostmanCollection(collection);
      }
    } catch (err) {
      log.error(err.message);
      log.warn('Tasty couldn\'t init endpoints from Postman collection');
    }
  }


  initFromPostmanCollection(collection) {
    let counter = 0;

    const declare = function(i) {
      if (i.item) return _.forEach(i.item, declare);
      if (i.request) {
        counter += 1;
        log.info(`${counter}) Declare ${i.request.url.path.join('/')} URL in Tasty App prom Postman collection`);
        return this.declare({
          url: i.request.url.path.join('/'),
          method: i.request.method.toLocaleLowerCase(),
          alias: '', // @todo
          headers: _.chain(i.request.header || [])
            .keyBy('key')
            .mapValues('value')
            .value(),
          body: _.get(i, ['request', 'body', 'raw'], '{}').startsWith('{') ? JSON.parse(_.get(i, ['request', 'body', 'raw'], '{}')) : _.get(i, ['request', 'body', 'raw'], '{}'),
          params: _.chain(i.request.url.query || [])
            .keyBy('key')
            .mapValues('value')
            .value(),
        });
      }
    }.bind(this);

    _.forEach(collection.item, declare);
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

module.exports = App;
