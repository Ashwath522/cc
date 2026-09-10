const nock = require('nock');
const config = require('../../../common/config');
const { fdkExtension } = require('./../../../fdk');

// API Mocks
const sdkNockInstance = nock(
  `https://api.${config.fynd_platform_domain}`,
).persist();

sdkNockInstance
  .get(
    `/service/panel/partners/v1.0/extensions/details/${config.extension.api_key}`,
  )
  .reply(200, { scope: fdkExtension.scopes });
