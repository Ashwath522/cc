'use strict';
require('dotenv').config();
const config = require('./app/common/config');
require('./app/init');
const logger = require('./app/common/logger');
const Sentry = require('./app/common/sentry');
const {webhookController} = require("./app/routes/controllers/webhook.controller");
const {connectProducers} = require("./app/kafka/producer");

(async function () {
  const errorTypes = ['unhandledRejection', 'uncaughtException'];
  const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  errorTypes.map((type) => {
    process.on(type, async (e) => {
      try {
        logger.info(`process.on ${type}`);
        logger.error(e);
        process.exit(0);
      } catch (error) {
        Sentry.captureException(error);
        process.exit(1);
      }
    });
  });

  signalTraps.map((type) => {
    process.once(type, async () => {
      try {
        process.exit(0);
      } finally {
        process.kill(process.pid, type);
      }
    });
  });

  await connectProducers();

  const app = require('./app/server');
  app.post('/webhooks', webhookController);
  const port = config.port || 3000;
  app.listen(port, () => {
    console.log(`Application Dev app listening at http://localhost:${port}`);
    require('./app/consumer');
    require('./app/scheduler/worker.service');
  });
})();
