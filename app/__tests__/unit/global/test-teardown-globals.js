const coverageSummary = require('./../../../../coverage/coverage-summary.json');
const request = require('./../utils/server')();
const mongo = require('./../../../common/mongo.init');
const redis = require('./../../../common/redis.init');

module.exports = async () => {
  console.log(coverageSummary.total);
  await redis.appRedis.disconnect();
  request.app.close();
  process.exit(0);
};
