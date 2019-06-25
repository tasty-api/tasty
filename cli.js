#!/usr/bin/env node

const program = require('commander');
const path = require('path');

const { name, major, minor, patch, codename } = require('./app');
const log = require('./libs/log')(module);
const Runner = require('./src/Runner');

const { TYPES, DEFAULT_TYPE } = require('./src/consts');

program
  .version(`${name} ${major}.${minor}.${patch} - ${codename}`, '-v, --version')
  .option('-d, --dir [path]', 'specify a directory', path.join(process.cwd(), 'test'))
  .option('-t, --type [func/load]', 'specify a type of a test',  DEFAULT_TYPE)
  .option('-c, --config [path to config]', 'specify a path to configuration file')
  .option('-p, --parallel [true/false]', 'specify a run mode', false)
  .parse(process.argv);

let { dir, type, config, parallel } = program;

if (!TYPES.has(type)) {
  log.warn(`Type ${type} doesn't exist. Run ${DEFAULT_TYPE} tests.`);
  type = DEFAULT_TYPE;
}

let runner = new Runner(dir);

runner.run(type, process.cwd(), config, parallel)
  .then(stats => {
    console.log(stats);
  })
  .catch((err) => {
    console.log(err);
  });
