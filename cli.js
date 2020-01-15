#!/usr/bin/env node

const program = require('commander');
const path = require('path');

const { name, major, minor, patch, codename } = require('./app');
const log = require('./libs/log')(module);
const Runner = require('./src/Runner');

const { TYPES, DEFAULT_TYPE } = require('./src/consts');
let files = [];

program.command('test <file> [files...]')
  .description('Test specified files')
  .action((file, filesList) => {
    files = filesList ? filesList.concat(file) : [file];
  });

program
  .version(`${name} ${major}.${minor}.${patch} - ${codename}`, '-v, --version')
  .option('-d, --dir [path]', 'specify a directory', path.join(process.cwd(), 'test'))
  .option('-t, --type [func/load]', 'specify a type of a test',  DEFAULT_TYPE)
  .option('-p, --parallel [true/false]', 'specify a run mode', false)
  .option('-F, --func_config [path to func config]', 'specify a path to func configuration file')
  .option('-L, --load_config [path to load config]', 'specify a path to load configuration file')
  .parse(process.argv);

let { dir, type, parallel, func_config, load_config } = program;

if (!TYPES.has(type)) {
  log.warn(`Type ${type} doesn't exist. Run ${DEFAULT_TYPE} tests.`);
  type = DEFAULT_TYPE;
}

let runner = new Runner(dir, func_config, load_config);

runner.run(type, parallel, files)
  .then(stats => {
    console.log(stats);
  })
  .catch((err) => {
    console.log(err);
  });
