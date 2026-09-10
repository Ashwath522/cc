const { mongo, redis } = require('./../../../init');
const axiosMock = require('./mocks');
// const mongo = require('./../../../common/mongo.init');
// const redis = require('./../../../common/redis.init');

function waitForConnection(conn) {
  return new Promise((resolve, reject) => {
    conn.on('connected', function () {
      resolve();
    });
    conn.on('error', function (err) {
      reject(err);
    });
  });
}

module.exports = async () => {
  await waitForConnection(mongo.host);
  await redis.appRedis.ping();
};
