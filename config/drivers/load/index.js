const Ajv = require('ajv');
const ajv = new Ajv({allErrors: true});

const getSchema = () => {
  const schema = {
    type: "object",
    properties: {
      config: {
        type: "object",
        properties: {
          tls: {
            type: "object",
            properties: {
              rejectUnauthorized: {type: "boolean"}
            },
            additionalProperties: true,
            required: ["rejectUnauthorized"]
          },
          http: {
            type: "object",
            properties: {
              timeout: {type: ["string", "integer"]}
            },
            additionalProperties: true,
            required: ["timeout"]
          },
          phases: {
            type: "array",
            items: [
              {
                type: "object",
                properties: {
                  duration: {
                    type: "integer"
                  },
                  arrivalRate: {
                    type: "integer"
                  }
                },
                additionalProperties: true,
                required: ["duration", "arrivalRate"],
              }
            ]
          }
        },
        required: ["tls", "http"],
        additionalProperties: true,
      }
    },
    additionalProperties: false
  };
  return schema;
};
const validate = (data, schema = getSchema()) => {
  const result = ajv.validate(schema, data);
  return {
    validationResult: result,
    validationErrors: !result ? ajv.errorsText() : null
  }
};

module.exports = {
  getSchema,
  validate
};

