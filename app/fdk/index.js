'use strict';

const { setupFdk } = require('fdk-extension-javascript/express');
const { RedisStorage } = require('fdk-extension-javascript/express/storage');
const config = require('../common/config');
const { appRedis } = require('./../common/redis.init');
const express = require('express');
const cluster_url = `https://api.${config.fynd_platform_domain}`;

console.log('config.extension.api_key', config.extension.api_key);
console.log('config.extension.api_secret', config.extension.api_secret);
console.log('config.extension.base_url', config.extension.base_url);
let fdkExtension;
try {
  fdkExtension = setupFdk({
    api_key: config.extension.api_key,
    api_secret: config.extension.api_secret,
    base_url: config.extension.base_url,
    scopes: [
      'company/saleschannel',
      'company/application/settings',
      'company/product',
    ],
    callbacks: {
      auth: async (req) => {
        // Write you code here to return initial launch url after suth process complete
        return `${req.extension.base_url}/company/${req.query['company_id']}`;
      },

      uninstall: async (req) => {
        // Write your code here to cleanup data related to extension
        // If task is time taking then process it async on other process.
      },
    },
    storage: new RedisStorage(appRedis, 'groot'),
    access_mode: 'offline',
    cluster: cluster_url, // this is optional by default it points to prod.
    debug: true,
  });
} catch (error) {
  console.error('FDK setup failed:', error.message);
  fdkExtension = {
    fdkHandler: (req, res, next) => next(),
    apiRoutes: express.Router(),
  };
}

module.exports = { fdkExtension };
