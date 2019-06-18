#!/usr/bin/env node

const path = require('path');
const { name, major, minor, patch, codename } = require('./app');
const Runner = require('./src/Runner');
//const config = require('./config');
//define various types and the default value when none of the types set
const TYPES = new Set(['func','load']);
const DEFAULT_TYPE = 'func';




module.exports = {
  App: require('./src/App'),
  tasty: new (require('./src/Tasty')),
  Runner: require('./src/Runner'),
  Services: require('./src/Services'),
};

//@ require.main === module  - check whether user executes this file directly from a command line or(when !==) via requiring this module
if (require.main === module) {
  const program = require('commander');

  program
    .version(`${name} ${major}.${minor}.${patch} - ${codename}`, '-v, --version')
    .option('-d, --dir [path]', 'specify a directory', false)
    .option('-t, --type [type_of_test]','specify type of a test (func | load) ','func')  //@ setting the dafault value for the type of test: func(functional)
    .option('-c, --config [path_to_config]', 'specify path to artillery configuration file',null)
    .option('-p, --parallel [true/false]', 'specify a run mode', false)
    .parse(process.argv);

  // check whether our type matches one of the types:
  const type  = TYPES.has(program.type) ? program.type : DEFAULT_TYPE;
  //@todo add paths to all configs, not just artilleryConfig!!!
  const configDir = program.config;

  // if the directory has not been set via command line, add previously obtained type to the full path of the tests' directory (+/load or +/func)
  // if the directory has been set, just use it as it is
  const dir  = program.dir === false ? path.join(process.cwd(), 'test') : program.dir;

  // set them to config configuration
  //config.set('type',type);
  //config.set('dir',dir);

  const runner = new Runner(dir);

  if(configDir!==null)
  {
    runner.run(type,configDir)
      .then(stats => {
        console.log(stats);
      });
  }
  else {
    runner.run(type)
      .then(stats => {
        console.log(stats);
      });
  }

}
