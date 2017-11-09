const winston = require("winston");
const dotenv = require("dotenv");
require("winston-loggly");

dotenv.load();

if (process.env.NODE_ENV === "test") {
  const logger = new winston.Logger();
} else {
  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL,
        timestamp: () => {
          return new Date().toISOString();
        }
      }),
      new winston.transports.Loggly({
        inputToken: process.env.LOGGLY_INPUT_TOKEN,
        subdomain: process.env.LOGGLY_SUBDOMAIN,
        tags: ["cs3219-backend-api"],
        json: true,
        level: process.env.LOG_LEVEL
      })
    ]
  });
}

module.exports = logger;
