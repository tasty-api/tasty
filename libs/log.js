const winston = require('winston');

const ENV = process.env.NODE_ENV || 'development';

module.exports = getLogger;

function getLogger(module) {
  const path = module.filename.split('/').slice(-2).join('/');

  return winston.createLogger({
    transports: [
      new winston.transports.Console({
        level: ENV === 'development' ? 'debug' : 'error',
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.label({ label: path }),
          winston.format.printf(info => `${info.level} [${info.label}]: ${info.message}`),
        ),
      }),
    ],
  });
}
