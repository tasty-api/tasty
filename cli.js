#!/usr/bin/env node

const program = require('commander');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');

const { name, major, minor, patch, codename } = require('./app');
const log = require('./libs/log')(module);
const Runner = require('./src/Runner');

const { TYPES, DEFAULT_TYPE, RUN_MODE, BUILD_MODE } = require('./src/consts');
const config = require('./config');
const utils = require('./libs/utils');

let mode = RUN_MODE;
let postmanCollection = null;
let stableServiceHost = null;

let files = [];

program.command('test <file> [files...]')
  .description('Test specified files')
  .action((file, filesList) => {
    files = filesList ? filesList.concat(file) : [file];
  });

program.command('build')
  .description('Build tests')
  .option('-t, --type [type]', 'type of source - postman or platformeco', 'postman')
  .option('-s, --source [path]', 'path to source - Postman collection or Platformeco definitions folder')
  .option('-h, --host [host]', 'specify stable service host for regression test')
  .action((opts) => {
    if (opts.type === 'postman') {
      const collectionFile = opts.source;

      if (!collectionFile) throw new Error('Postman collection config doesn\'t specify');

      const content = fs.readFileSync(path.resolve(collectionFile), 'utf8');
      postmanCollection = JSON.parse(content);
      stableServiceHost = opts.host;

      if (_.isUndefined(_.get(postmanCollection, ['info', '_postman_id']))) throw new Error('It doesn\'t seem like a Postman collection');

      if (!stableServiceHost) throw new Error('Stable service host doesn\'t specify');

      config.set('postman:collection', postmanCollection);
      config.set('postman:stable', stableServiceHost);
    } else {
      config.set('platformeco:definitions', opts.source);
    }
    mode = BUILD_MODE;
  });

program.on('--help', function(){
  console.log('');
  console.log('Examples:');
  console.log('  $ tasty build -s app/postman_collection.json -h http://www.mystableservice.com');
});

program
  .version(`${name} ${major}.${minor}.${patch} - ${codename}`, '-v, --version')
  .option('-d, --dir [path]', 'specify a directory', path.join(process.cwd(), 'test'))
  .option('-t, --type [func/load]', 'specify a type of a test',  DEFAULT_TYPE)
  .option('-p, --parallel [true/false]', 'specify a run mode', false)
  .option('-F, --func_config [path to func config]', 'specify a path to func configuration file')
  .option('-L, --load_config [path to load config]', 'specify a path to load configuration file')
  .option('-C, --postman_collection [path]', 'specify a path to Postman collection file')
  .option('-D, --platformeco_definitions [path]', 'specify a path to Platformeco definitions directory')
  .parse(process.argv);

switch(mode) {
  case BUILD_MODE:
    utils.buildRegressionTests({
      postmanCollection,
      stableServiceHost,
    })
      .then((stats) => {
        console.log(stats);
        console.log(stats.length);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.length);
        log.warn('Error');
      });
    break;
  case RUN_MODE:
  default:
    let {
      dir, type, parallel, func_config, load_config, postman_collection, platformeco_definitions, stable_service_host,
    } = program;

    config.set('postman:collection', postman_collection);
    config.set('postman:stable', stable_service_host);
    config.set('platformeco:definitions', platformeco_definitions);

    if (!TYPES.has(type)) {
      log.warn(`Type ${type} doesn't exist. Run ${DEFAULT_TYPE} tests.`);
      type = DEFAULT_TYPE;
    }

    let runner = new Runner({
      testsDir: dir,
      funcCfg: func_config,
      loadCfg: load_config,
    });

    runner.run(type, parallel, files)
      .then(stats => {
        console.log(stats);
      })
      .catch((err) => {
        console.log(err);
      });
    break;
}
