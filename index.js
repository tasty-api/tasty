#!/usr/bin/env node

const path = require('path');
const { name, major, minor, patch, codename } = require('./app');
const Runner = require('./src/Runner');

module.exports = {
  App: require('./src/App'),
  tasty: new (require('./src/Tasty')),
  Runner: require('./src/Runner'),
  Services: require('./src/Services'),
};

if (require.main === module) {
  const program = require('commander');

  program
    .version(`${name} ${major}.${minor}.${patch} - ${codename}`, '-v, --version')
    .option('-d, --dir [path]', 'specify a directory', path.join(process.cwd(), 'test'))
    .option('-p, --parallel [true/false]', 'specify a run mode', false)
    .option('-t, --type [type]', 'specify a testing type', 'func')
    .parse(process.argv);

  const { dir, parallel, type } = program;
  const runner = new Runner(dir);

  runner.run(type, parallel)
    .then(stats => {
      console.log(stats);
    });
}
