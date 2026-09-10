const { isEmpty, groupBy } = require('lodash');
const logger = require('../common/logger');

const setDataLoaders = async (applicationClient, baseUrl) => {
  try {
    const dataLoaders = await getDataLoaders(applicationClient);
    if (isEmpty(dataLoaders?.items)) {
      return applicationClient;
    }
    const loaderServices = groupBy(dataLoaders?.items, 'service');
    for (const service in loaderServices) {
      const loaders = loaderServices[service];
      const newUrls = loaders.reduce((urls, item) => {
        urls[item.operation_id] = `https://${baseUrl}${item.url}`;
        return urls;
      }, {});
      applicationClient[service].updateUrls(newUrls);
    }
    return applicationClient;
  } catch (error) {
    logger.error(error);
  }
};

const getDataLoaders = async (applicationClient) => {
  try {
    return await applicationClient.content.getDataLoaders();
  } catch (e) {
    return null;
  }
};

module.exports = { setDataLoaders };
