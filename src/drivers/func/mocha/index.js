const path = require('path');
const Mocha = require('mocha');
const mLog = require('mocha-logger');
const _ = require('lodash');
const axios = require('axios');
const { promisify } = require('util');
const parallel = promisify(require('async/parallel'));
const concat = promisify(require('async/concat'));
const concatSeries = promisify(require('async/concatSeries'));
const config = require('../../../../config');
const uuid = require('uuid/v4');

const utils = require('../../../../libs/utils');

module.exports = {
  get,
  run,
  request,
  case: suite,
  test,
  tests,
  log,
  think,
};

function get(files) {
  const reportDir = Date.now().toString();

  return files.map(file => getMocha(file, reportDir));
}

async function run(tests, isParallel, logStream) {
  await utils.enhanceNativeLogger('func_log.html', logStream);

  const stats = isParallel
    ? await concat(tests, runTest)
    : await concatSeries(tests, runTest);

  utils.resetNativeLogger();

  return formatStats(stats, isParallel);
}

function request(getParams, mock, capture, resource) {
  return async (context = {}, uid) => {
    const params = getParams(context);

    // @todo implement Resource.setResponse
    resource.res = mock
      ? mockRequest(params, mock)
      : await realRequest(params, uid);

    // @todo implement Resource.captureData
    resource.capturedData = utils.captureData(capture, resource.res);

    return resource;
  };
}

async function suite(title, prepare, actions, tasty) {
  const sets = splitActions(actions);

  if (prepare) await tasty.series(...prepare)();

  Mocha.describe(title, () => {
    if (sets.before.length) {
      Mocha.before(() => tasty.series(...sets.before)());
    }

    if (sets.beforeEach.length) {
      Mocha.beforeEach(() => tasty.series(...sets.beforeEach)()); // @todo need-tests
    }

    sets.tests.forEach(test => test(tasty)); // @todo question: Maybe call test in tasty context?

    if (sets.afterEach.length) {
      Mocha.afterEach(() => tasty.series(...sets.afterEach)()); // @todo need-tests
    }

    if (sets.after.length) {
      Mocha.after(() => tasty.series(...sets.after)()); // @todo need-tests
    }
  });

  if (prepare) Mocha.run();
}

function test(title, request, assertions, tasty) {
  const uid = uuid();

  Mocha.it(title, async () => {
    const resource = await request(tasty.context, uid);
    const traceLink = resource.getTraceLink(uid);

    traceLink && mLog.log(traceLink);

    Object.keys(assertions).forEach(assertion => {
      resource[assertion](assertions[assertion], tasty.context);
    });
  });
}

function tests(title, suites, request, assertions, isParallel, tasty) {
  suites = typeof suites === 'string' ? tasty.context[suites] : suites;

  if (isParallel) {
    let responses = [];

    Mocha.before(async () => {
      responses = await parallel(suites.map(suite => {
        const uid = uuid();

        return async () => ({
          resource: utils.cloneInstance(await request({
            ...tasty.context,
            suite,
          }, uid)),
          uid,
        });
      }));
    });

    suites.forEach((suite, i) => {
      Mocha.it(utils.evalTpl(title, { suite }), () => {
        const traceLink = responses[i].resource.getTraceLink(responses[i].uid);

        traceLink && mLog.log(traceLink);

        Object.keys(assertions).forEach(assertion => {
          const value = typeof assertions[assertion] === 'string'
            ? utils.evalTpl(assertions[assertion], { suite })
            : assertions[assertion];

          responses[i].resource[assertion](value, { suite });
        });
      });
    });
  } else {
    suites.forEach((suite) => {
      const uid = uuid();

      Mocha.it(utils.evalTpl(title, { suite }), async () => {
        const resource = await request({
          ...tasty.context,
          suite,
        }, uid);
        const traceLink = resource.getTraceLink(uid);

        traceLink && mLog.log(traceLink);

        Object.keys(assertions).forEach(assertion => {
          const value = typeof assertions[assertion] === 'string'
            ? utils.evalTpl(assertions[assertion], { suite })
            : assertions[assertion];

          resource[assertion](value, { suite });
        });
      });
    });
  }
}

function log() {
  // @todo implement logging tests
}

function think(seconds) {
  // @todo implement pausing tests
}

function getMocha(file, reportDir) {
  resetCache(file);
  const fileName = path.basename(file, '.js');

  const cfgPath = config.get('func_cfg');

  resetCache(cfgPath);//reset the require cache to get the fresh version of config file if it has been rewritten

  const _cfg = require(cfgPath);
  const cfg = {
    reporterOptions: {
      reportDir: path.join(_.get(_cfg, 'reporterOptions.reportDir'), reportDir, fileName),
    }
  };

  if (file.includes('prep')) {
    cfg.delay = true;
  }

  const mocha = new Mocha(_.merge({}, _cfg, cfg));

  return mocha.addFile(path.resolve(file));
}

function runTest(test, cb) {
  const runner = test.run(() => {
    cb(null, runner.stats);
  });
}

function formatStats(stats, isParallel) {
  const res = {
    start: _.get(stats, '[0].start', 0),
    end: isParallel ? null : _.get(stats, `[${stats.length - 1}].end`, 0),
    suites: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0,
    duration: 0,
  };

  stats.forEach((stat) => {
    res.suites += _.get(stat, 'suites', 0);
    res.tests += _.get(stat, 'tests', 0);
    res.passes += _.get(stat, 'passes', 0);
    res.pending += _.get(stat, 'pending', 0);
    res.failures += _.get(stat, 'failures');

    if (isParallel) {
      res.end = _.get(stat, 'duration', 0) > res.duration ? _.get(stat, 'end', 0) : res.end;
      res.duration = _.get(stat, 'duration', 0) > res.duration ? _.get(stat, 'duration', 0) : res.duration;
    } else {
      res.duration += _.get(stat, 'duration', 0);
    }
  });

  res.duration += 'ms';

  return res;
}

function mockRequest(params, mock) {
  return {
    data: mock,
  };
}

async function realRequest(params, uid) {
  try {
    return await axios({
      method: params.method,
      url: params.url,
      headers: {
        ...(uid ? { ...params.headers, 'x-request-id': uid } : params.headers),
      },
      params: params.params,
      data: params.body,
    });
  } catch (err) {
    return err.response;
  }
}

/**
 * @function splitActions - Split action on three five groups
 * @param {function[]} actions - Tests actions
 * @returns {object} - Object with actions' groups
 */
function splitActions(actions) {
  return actions.reduce((sets, action) => {
    if (typeof action === 'function' && (action.name === 'test' || action.name === 'tests')) {
      sets.tests.push(action);

      return sets;
    }

    if (sets.tests.length) {
      if (Array.isArray(action)) {
        sets.afterEach.push(action);
      } else {
        sets.after.push(action);
      }

      return sets;
    }

    if (Array.isArray(action)) {
      sets.beforeEach.push(action);
    } else {
      sets.before.push(action);
    }

    return sets;
  }, {
    before: [],
    beforeEach: [],
    after: [],
    afterEach: [],
    tests: [],
  });
}

function resetCache(testModule) {
  if (require.cache[path.resolve(testModule)]) {
    delete require.cache[path.resolve(testModule)];
  }
}
