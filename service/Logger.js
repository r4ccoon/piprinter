const winston = require("winston");
const Sentry = require("winston-transport-sentry-node").default;

const options = {
  sentry: {
    dsn: process.env.SENTRY_DSN
  },
  level: "error"
};

const logger = winston.createLogger({
  transports: [
    new Sentry(options),
    new winston.transports.Console({ level: "info" })
  ]
});

module.exports = logger;
