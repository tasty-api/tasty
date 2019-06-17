const Mocha = require('mocha');
const path = require('path');
const { promisify } = require('util');
const concat = promisify(require('async/concat'));
const concatSeries = promisify(require('async/concatSeries'));
const get = require('lodash.get');

module.exports.get = async (files) => {
  const reportDir = Date.now();

  return files.map(file => getMocha(file, reportDir));
};

module.exports.run = async (tests, isParallel) => {
  const stats = isParallel
    ? await concat(tests, runTest)
    : await concatSeries(tests, runTest);

  return formatStats(stats, isParallel);
};

function getMocha(file) {
  resetCache(file);

  // @todo Provide options for mocha runner
  const mocha = new Mocha();

  return mocha.addFile(path.resolve(file));
}

function resetCache(testModule) {
  if (require.cache[path.resolve(testModule)]) {
    delete require.cache[path.resolve(testModule)];
  }
}

function runTest(test, cb) {
  const runner = test.run(() => {
    cb(null, runner.stats);
  });
}

function formatStats(stats, isParallel) {
  const res = {
    start: get(stats, '[0].start', 0),
    end: isParallel ? null : get(stats, `[${stats.length - 1}].end`, 0),
    suites: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0,
    duration: 0,
  };

  stats.forEach((stat) => {
    res.suites += get(stat, 'suites', 0);
    res.tests += get(stat, 'tests', 0);
    res.passes += get(stat, 'passes', 0);
    res.pending += get(stat, 'pending', 0);
    res.failures += get(stat, 'failures');

    if (isParallel) {
      res.end = get(stat, 'duration', 0) > res.duration ? get(stat, 'end', 0) : res.end;
      res.duration = get(stat, 'duration', 0) > res.duration ? get(stat, 'duration', 0) : res.duration;
    } else {
      res.duration += get(stat, 'duration', 0);
    }
  });

  res.duration += 'ms';

  return res;
}
