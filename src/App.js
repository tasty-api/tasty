const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const requireDir = require('require-dir');
const log = require('../libs/log')(module);
const Resource = require('./Resource');
const config = require('../config');

/** Class representing an application */
class App {
  /**
   * Create an application with name and configuration
   * @param {string} name - Application name
   * @param {object} config - Application configuration
   * @property {object} config.host - Hosts' list by environment
   * @property {string} config.host.develop - Host for development environment
   * @property {string} config.host.testing - Host for testing environment
   * @property {string} config.host.product - Host for production environment
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

      const postmanCollectionFile = config.get('postman:collection');

      if (postmanCollectionFile) {
        const content = fs.readFileSync(path.resolve(postmanCollectionFile), { encoding: 'utf-8' });
        const collection = JSON.parse(content);

        if (_.isUndefined(_.get(collection, ['info', '_postman_id']))) throw new Error('It doesn\'t seem like a Postman collection.');

        this.initFromPostmanCollection(collection);
      }

      const platformecoDefinitionsDir = config.get('platformeco:definitions');
      if (platformecoDefinitionsDir) {
        log.warn('Initialization of endpoints from Platformeco definitions not implemented yet')
      }
    } catch (err) {
      log.error(err.message);
      log.warn('Tasty couldn\'t init endpoints from Postman collection');
    }
  }

  initFromPostmanCollection(i, parentName = '') {
    if (i.item) return _.forEach(i.item, (j) => this.initFromPostmanCollection(j, i.name));

    if (i.request) {
      log.info(`Declare ${i.request.url.path.join('/')} ${i.request.method.toLowerCase()} URL in Tasty App prom Postman collection`);

      return this.declare({
        url: i.request.url.path.join('/'),
        methods: [i.request.method.toLowerCase()],
        alias: `${parentName}:${i.name}`,
        headers: _.chain(i.request.header || [])
          .keyBy('key')
          .mapValues('value')
          .value(),
        body: _.get(i, ['request', 'body', 'raw'], '{}').startsWith('{') ?
          JSON.parse(_.get(i, ['request', 'body', 'raw'], '{}')) :
          _.get(i, ['request', 'body', 'raw']),
        params: _.chain(i.request.url.query || [])
          .keyBy('key')
          .mapValues('value')
          .value(),
      });
    }
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
