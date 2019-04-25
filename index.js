#!/usr/bin/env node

const path = require('path');
const requireDir = require('require-dir');
const { name, major, minor, patch, codename } = require('./app');
const Runner = require('./src/Runner');

module.exports = {
  App: require('./src/App'),
  tasty: new (require('./src/Tasty')),
  Runner: require('./src/Runner'),
};

if (require.main === module) {
  const program = require('commander');

  program
    .version(`${name} ${major}.${minor}.${patch} - ${codename}`, '-v, --version')
    .option('-d, --dir [path]', 'specify a directory', path.join(process.cwd(), 'test'))
    .parse(process.argv);

  const { dir } = program;

  const runner = new Runner(dir);

  runner.run()
    .then(stats => {
      console.log(stats);
    });
}
