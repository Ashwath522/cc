'use strict';

const _ = require('lodash');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');

const options = {
  appName: config.pod_name, // Your DB Name
  readPreference: 'secondaryPreferred',
  keepAlive: true,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  w: 'majority',
  retryWrites: true,
};

const mConnections = {};

_.forEach(config.mongo, (m, key) => {
  const { uri } = m;
  mConnections[key] = setupMongoose(uri);
});

/**
 * Connect to MongoDB
 * @param {string} uri
 * @returns {mongoose.Connection}
 */
function setupMongoose(uri) {
  const conn = mongoose.createConnection(uri, options);

  conn.on('connected', function () {
    logger.info(`${conn.name} default connection is open`);
  });
  conn.on('disconnected', function () {
    logger.info(`${conn.name} default connection is disconnected`);
  });

  conn.on('error', function (err) {
    logger.error(err);
  });
  return conn;
}

module.exports = mConnections;
