const winston = require("winston");

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp: () => {
        return (new Date()).toISOString();
      }
    })
  ]
});

module.exports = logger;
