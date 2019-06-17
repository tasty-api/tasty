const jsdoc = require('jsdoc-to-markdown');
const log = require('./log')(module);

jsdoc.render({ files: '../src/**/*.js' }).then(log.info);
