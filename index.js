'use strict';
require('./app/common/newrelic');
require('events').setMaxListeners(100);
require('dotenv').config();
const config = require('./app/common/config');
require('./app/init');
const { APP_MODE } = require('./app/constants/constant');
const Sentry = require('@sentry/node');
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

  const appMode = config.mode;

  if (appMode === APP_MODE.SERVER) {
    const { startBulkImportWorker } = require('./app/workers/bulk-import.worker');
    startBulkImportWorker();
    const { startAiContentWorker } = require('./app/workers/ai-content.worker');
    startAiContentWorker();
    const app = require('./app/server');
    const port = config.port || 8082;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Application app listening at http://localhost:${port}`);
    });
  } else {
    console.log('Invalid mode');
  }
})();
