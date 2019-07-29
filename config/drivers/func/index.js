const Ajv = require('ajv');
const ajv = new Ajv({ allErrors: true });

const getSchema = () => {
  const schema = {
    type: 'object',
    properties: {
      reporter: {
        type: 'string',
      },
      reporterOptions: {
        type: 'object',
        properties: {
          reportDir: {
            type: 'string',
          },
          reportFilename: {
            type: 'string',
          }
        },
        required: ['reportDir', 'reportFilename'],
        additionalProperties: true
      },
      color: {
        type: 'boolean'
      },
      allowUncaught: {
        type: 'boolean'
      },
      asyncOnly: {
        type: 'boolean'
      },
      bail: {
        type: 'boolean'
      },
      checkLeaks: {
        type: 'boolean'
      },
      delay: {
        type: 'boolean'
      },
      enableTimeouts: {
        type: 'boolean'
      },
      fgrep: {
        type: 'boolean'
      },
      forbidOnly: {
        type: 'boolean'
      },
      forbidPending: {
        type: 'boolean'
      },
      fullStackTrace: {
        type: 'boolean'
      },
      global: {
        type: 'array',
        items: [
          { type: 'string' }
        ]
      },
      /*grep:{
        type:""
      },*/ //regexp - mark it as an additional property
      growl: {
        type: 'boolean'
      },
      hideDiff: {
        type: 'boolean'
      },
      ignoreLeaks: {
        type: 'boolean'
      },
      invert: {
        type: 'boolean'
      },
      noHighlighting: {
        type: 'boolean'
      },
      retries: {
        type: 'number'
      },
      slow: {
        type: 'number'
      },
      timeout: {
        type: ['number', 'string']
      },
      ui: {
        type: 'string'
      },
      useInlineDiffs: {
        type: 'boolean'
      },
    },
    required: ['reporter', 'reporterOptions'],
    additionalProperties: true
  };
  return schema;
};
const validate = (data, schema = getSchema()) => {
  const result = ajv.validate(schema, data);
  return {
    validationResult: result,
    validationErrors: !result ? ajv.errorsText() : null
  };
};
module.exports = {
  getSchema,
  validate
};



