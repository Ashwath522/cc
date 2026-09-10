'use strict';

const Redis = require('ioredis');
const config = require('./config');
const logger = require('./logger');

function connect(name, uri) {
  const db = new Redis(uri, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    reconnectOnError: function (err) {
      let targetError = 'EAI_AGAIN';
      if (err.message.includes(targetError)) {
        return true;
      }
    },
  });
  db.on('connect', () => {
    logger.info(`Redis ${name} connected.`);
  });
  db.on('ready', () => {
    logger.info(`Redis ${name} is ready`);
  });
  db.on('error', () => {
    logger.info(`Redis ${name} got error`);
  });
  db.on('close', () => {
    logger.info(`Redis ${name} is closed`);
  });
  db.on('reconnecting', () => {
    logger.info(`Redis ${name} got error`);
  });
  db.on('reconnecting', () => {
    logger.info(`Redis ${name} is ended`);
  });
  return db;
}

const appRedis = connect('Host Read Write', config.redis.host);
const bullRedis = connect('BullHost Read Write', config.redis.host);

module.exports = { appRedis, bullRedis };
