'use strict';
const mongo = require('./common/mongo.init');
const redis = require('./common/redis.init');
require('./common/sentry');

module.exports = {
  mongo,
  redis,
};
