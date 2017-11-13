const winston = require("winston");
const dotenv = require("dotenv");
require("winston-loggly");

/**
 * Winston logger middleware.
 *
 * https://github.com/winstonjs/winston
 */

dotenv.load();

const transports = [
  new winston.transports.Console({
    level: process.env.LOG_LEVEL,
    timestamp: () => {
      return new Date().toISOString();
    }
  })
];

// only in production, the logs will be sent Loggly
if (process.env.NODE_ENV === "production") {
  transports.push(new winston.transports.Loggly({
    inputToken: process.env.LOGGLY_INPUT_TOKEN,
    subdomain: process.env.LOGGLY_SUBDOMAIN,
    tags: ["cs3219-backend-api"],
    json: true,
    level: process.env.LOG_LEVEL
  }));
}

const logger = new winston.Logger({
  transports
});

module.exports = logger;
