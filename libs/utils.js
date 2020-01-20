const jsonpath = require('jsonpath');
const _ = require('lodash');
const path = require('path');
const util = require('util');
const fs = require('fs');
const mkdirp = require('mkdirp');
const Convert = require('ansi-to-html');

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
  return _.isObject(value) ?
    _.mapValues(value, _value => mapValuesDeep(_value, func)) :
    func(value);
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
  return Object.assign(Object.create(instance), instance);
}
