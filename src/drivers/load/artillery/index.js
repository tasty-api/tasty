const path = require('path');
const fs = require('fs');
const logger = require('../../../../libs/log')(module);
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const artillery= require('yl-artillery');
const loadRun = promisify(artillery.run);
const _ = require('lodash');
const utils = require('../../../../libs/utils');
const config = require('../../../../config');
const mkdir = require('mkdirp');

const TEMP_LOAD_CONFIG = '.artillery.json.tmp';
const TEMP_LOAD_OUTPUT = '.artillery.o.tmp';

module.exports = {
  get,
  run,
  request,
  case: scenario,
  test,
  tests,
  log,
  think,
};

function get(files) {
  return files.map(file => require(file));
}

async function run(scenarios, isParallel, logStream) {
  try {
    const hosts = config.get('hosts');

    const env = config.get('env');
    const cfg = {
      config: {
        target: hosts[env],
      },
      scenarios,
    };

    _.merge(cfg, require(config.get('load_cfg')));

    const logFile = path.join(process.cwd(), 'reports', 'load', Date.now().toString(), 'index.html');

    await writeFile(path.resolve(TEMP_LOAD_CONFIG), JSON.stringify(cfg, null, 2));

    await utils.enhanceNativeLogger('load_log.html', logStream);

    await loadRun(TEMP_LOAD_CONFIG, {
      ...(logFile ? {
        output: TEMP_LOAD_OUTPUT,
        // quiet: true,
      } : {}),
    });

    utils.resetNativeLogger();
    let stats;
    if (logFile) {
      const { dir } = path.parse(logFile);

      try {
        await mkdir(dir);
      } catch (err) {
        logger.warn(`${err.path} directory has already created`);
      }

      artillery.report(TEMP_LOAD_OUTPUT, {
        output: logFile,
      });

      stats = fs.readFileSync(TEMP_LOAD_OUTPUT);

      await unlink(TEMP_LOAD_OUTPUT);
    }

    await unlink(TEMP_LOAD_CONFIG);

    return JSON.parse(stats.toString());
  } catch(err) {
    await Promise.reject(new Error(err));
  }
}

function request(getParams, mock, capture, resource, opts, cache) {
  const headers = utils.mapMustacheTpl(_.assign({}, resource.headers, cache.headers, opts.headers));
  const params = utils.mapMustacheTpl(_.assign({}, resource.params, cache.params, opts.params));
  const body = utils.mapMustacheTpl(_.assign({}, resource.body, cache.body, opts.body));

  return {
    [opts.method]: {
      url: `${resource.url ? `/${resource.url}` : ''}${opts.path ? `/${opts.path}` : ''}`,
      ...(_.isEmpty(headers) ? {} : { headers }),
      ...(_.isEmpty(params) ? {} : { qs: params }),
      ...(_.isEmpty(body) ? {} : { json: body }),
      ...(_.isEmpty(capture) ? {} : { capture }),
    },
  };
}

function scenario(title, actions) {
  return {
    name: title,
    flow: actions,
    // @todo add weight option
  };
}

function test() {
  return null;
}

function tests() {
  return null;
}

function log(message) {
  return {
    log: utils.getMustacheTpl(message),
  };
}

function think(seconds) {
  return {
    think: seconds,
  };
}
