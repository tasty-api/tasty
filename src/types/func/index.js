const Mocha = require('mocha');
const path = require('path');
const { promisify } = require('util');
const concat = promisify(require('async/concat'));
const concatSeries = promisify(require('async/concatSeries'));

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
    start: stats[0].start,
    end: isParallel ? null : stats[stats.length - 1].end,
    suites: 0,
    tests: 0,
    passes: 0,
    pending: 0,
    failures: 0,
    duration: 0,
  };

  stats.forEach((stat) => {
    res.suites += stat.suites;
    res.tests += stat.tests;
    res.passes += stat.passes;
    res.pending += stat.pending;
    res.failures += stat.failures;

    if (isParallel) {
      res.end = stat.duration > res.duration ? stat.end : res.end;
      res.duration = stat.duration > res.duration ? stat.duration : res.duration;
    } else {
      res.duration += stat.duration;
    }
  });

  res.duration += 'ms';

  return res;
}
