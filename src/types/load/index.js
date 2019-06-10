const artilleryRunner = require('lmartillery');
const {promisify} = require('util');
const loadRun = promisify(artilleryRunner.run);
const path = require('path');
const fs = require('fs');
module.exports.get = async (files) => {
  const reportDir = Date.now();

  return files.map(file => require(file));
};

/**
 *
 * @param config will have scenarios
 * @param pathToSaveFile
 * @returns {Promise<{duration, tests, failures, suites, passes, pending, start, end}>}
 */
module.exports.run = async (config, pathToSaveFile) => {
  const resultFile = path.resolve(path.join(pathToSaveFile, './._load.tmp.output.json'));
  const results = await loadRun(config, {output: resultFile,quiet:true});
  artilleryRunner.report(resultFile,{});
  return true;
};
