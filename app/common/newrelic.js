const config = require('./config');
const logger = require('./logger');
// // newrelic
if (config.newrelic.app_name && config.newrelic.license_key) {
  logger.info('Loading newrelic npm package now');
  require('newrelic');
} else {
  logger.warn('Newrelic configuration not found');
}
