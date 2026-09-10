const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const { fdkExtension } = require('../../fdk');
const { setDataLoaders } = require('../../fdk/data-loaders');

const getSearchProducts = async (req, res, next) => {
  let { application_id } = req.params;
  try {
    if (application_id === '') {
      throw new Error('Unknown sales channel');
    }
    const { platformClient } = req;
    const { token } = await platformClient
      .application(application_id)
      .configuration.getApplicationById();
    const applicationClient = await fdkExtension.getApplicationClient(
      application_id,
      token,
    );
    const { domain } = await applicationClient.configuration.getApplication();
    await setDataLoaders(applicationClient, domain?.name);
    const response = await applicationClient.catalog.getProducts({
      filters: true,
      q: req.query.q,
      f: 'tags!:combo',
    });
    return res.json(response);
  } catch (error) {
    logger.error(`error getSearchProducts ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};


module.exports = { getSearchProducts };
