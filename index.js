#!/usr/bin/env node

const path = require('path');
const requireDir = require('require-dir');
const log = require('./libs/log')(module);
const { name, major, minor, patch, codename } = require('./app');
const Mocha = require('mocha');
const recursive = require('recursive-readdir');

module.exports = {
  App: require('./src/App'),
  tasty: new (require('./src/Tasty')),
};

if (require.main === module) {
  const program = require('commander');

  program
    .version(`${name} ${major}.${minor}.${patch} - ${codename}`, '-v, --version')
    .option('-d, --dir [path]', 'specify a directory', path.join(process.cwd(), 'test'))
    .parse(process.argv);

  const { dir } = program;

  log.info(`Test path is ${dir}`);

  const mocha = new Mocha();

  recursive(
    dir,
    (err, files) => {
      files.forEach((file) => mocha.addFile(file))
      mocha.run(); // @todo Add opportunity to run tests in parallel or series
    }
  );

  log.info('Start testing');
  log.info('Finish testing.');
}
