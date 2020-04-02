const jsonpath = require('jsonpath');
const _ = require('lodash');
const path = require('path');
const util = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Convert = require('ansi-to-html');
const rimraf = require('rimraf');
const { promisify } = require('util');
const parallel = promisify(require('async/parallel'));
const GenerateSchema = require('generate-schema');
const axios = require('axios');

const log = require('./log')(module);

const unlink = util.promisify(fs.unlink);
const mkdir = util.promisify(mkdirp);

const convert = new Convert();

const NATIVE_LOGGER = console.log;

module.exports = {
  evalTpl,
  evalObj,
  captureData,
  getMustacheTpl,
  mapMustacheTpl,
  enhanceNativeLogger,
  resetNativeLogger,
  cloneInstance,
  buildRegressionTests,
};

function evalTpl(tpl = '', context = {}) {
  const func = new Function(`with(this) { return ${'`' + tpl + '`'}; }`);

  return func.call(context);
}

function evalObj(obj = {}, context) {
  return mapValuesDeep(obj, item => {
    return typeof item === 'string' ? evalTpl(item, context) : item;
  });
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

function getMustacheTpl(str) {
  return _.replace(str, /\${[^{}]+}/g, (match) => {
    return `{{ ${match.match(/[^${}]+/)[0]} }}`;
  });
}

function mapMustacheTpl(obj) {
  return mapValuesDeep(obj, value => getMustacheTpl(value));
}

function mapValuesDeep(value, func) {
  switch (true) {
    case (Array.isArray(value)):
      return _.map(value, _value => mapValuesDeep(_value, func));
    case (_.isObject(value)):
      return _.mapValues(value, _value => mapValuesDeep(_value, func));
    default:
      return func(value);
  }
}

async function enhanceNativeLogger(logFile = 'log.html', logStream) {
  const logOutput = path.join(process.cwd(), 'logs', logFile);

  try {
    await unlink(logOutput);
  } catch (err) {
    log.warn(`${err.path} functional log file has already removed`);
  } finally {
    const { dir } = path.parse(logOutput);

    try {
      await mkdir(dir);
    } catch (err) {
      log.warn(`${err.path} directory has already created`);
    }
  }

  console.log = function log(...args) {
    if (args.length) {
      const [tpl, ...tail] = args;

      const string = util.format(tpl, ...tail) || '';
      const html = convert.toHtml(string).replace(/(http.*)$/, (match, p1) => `<a target="_blank" href=${p1}>${decodeURI(p1)}</a>`);

      if (html.indexOf('mochawesome') === -1) {
        fs.appendFileSync(logOutput, html);
        fs.appendFileSync(logOutput, '<br>');
        logStream.push(html + '<br>');
      }
    }

    NATIVE_LOGGER(...args);
  };
}

function resetNativeLogger() {
  console.log = NATIVE_LOGGER;
}

function cloneInstance(instance) {
  return _.cloneDeep(instance);
}

async function buildRegressionTests(opts) {
  const postmanEndpointsList = _.flattenDeep(getPostmanEndpointsList(opts.postmanCollection));

  const responses = await parallel(
    _.map(postmanEndpointsList, (endpoint) => {
      return async () => {
        try {
          const response = await axios({
            method: endpoint.method,
            url: `${opts.stableServiceHost}/${endpoint.url}`,
            headers: endpoint.headers,
            params: endpoint.params,
            data: endpoint.body,
          });

          return {
            endpoint,
            response,
            schema: GenerateSchema.json(endpoint.url, response.data),
          };
        } catch(err) {
          return {
            endpoint,
            response: err.response,
            schema: GenerateSchema.json(endpoint.url, err.status !== 500 ? err.response.data : {}),
          };
        }
      };
    }),
  );

  const regressionTestsDir = path.join(process.cwd(), 'test', 'func', 'postman_regression_tests');

  if (fs.existsSync(regressionTestsDir)) {
    rimraf.sync(regressionTestsDir);
    log.warn('Regression tests have already built. Tasty will overwrite old regression tests');
  }

  fs.mkdirSync(regressionTestsDir);

  _.forEach(responses, (res, i) => {
    const template = getTestTemplate(res);
    log.debug(`${i + 1} - Write test for ${res.endpoint.name}`);

    fs.writeFileSync(path.join(regressionTestsDir, `${res.endpoint.name}.js`), template);
  });

  return responses;
}

function getPostmanEndpointsList(i, parentName = '') {
  if (i.item) return _.map(i.item, (j) => getPostmanEndpointsList(j, i.name));

  if (i.request) {
    return {
      name: `${parentName}:${i.name}`,
      url: _.get(i, ['request', 'url', 'path'], []).join('/'),
      method: _.get(i, ['request', 'method'], '').toLowerCase(),
      alias: `${parentName}:${i.name}`,
      headers: _.chain(_.get(i, ['request', 'header'], []))
        .keyBy('key')
        .mapValues('value')
        .value(),
      body: _.get(i, ['request', 'body', 'raw'], '{}').startsWith('{') ?
        JSON.parse(_.get(i, ['request', 'body', 'raw'], '{}')) :
        _.get(i, ['request', 'body', 'raw']),
      params: _.chain(_.get(i, ['request', 'url', 'query'], []))
        .keyBy('key')
        .mapValues('value')
        .value(),
    };
  }
}

function getTestTemplate({ endpoint, response, schema }) {
  return `const app = require('../../../app');
const tasty = require('tasty-api').tasty;

const regressionSchema = ${JSON.stringify(schema, null, 2)};

tasty.case(
  'Regress Test for ${endpoint.url}',
  null,
  tasty.test(
    'Regression test for ${endpoint.name} with url ${endpoint.url}',
    app['${endpoint.alias}'].${endpoint.method}(),
    {
      checkStatus: ${response.status},
      checkStructure: regressionSchema,
    },
  ),
);
`;
}
