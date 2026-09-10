'use strict';

const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const { fdkExtension } = require('../../fdk');
const { setDataLoaders } = require('../../fdk/data-loaders');

const getSearchProducts = async (req, res, next) => {
  const { application_id } = req.params;
  const { q } = req.query;

  try {
    if (!application_id) {
      throw new Error('Unknown application id');
    }

    const { platformClient } = req;
    const { token } = await platformClient
      .application(application_id)
      .configuration.getApplicationById();
    const applicationClient = await fdkExtension.getApplicationClient(
      application_id,
      token,
    );
    const response = await applicationClient.catalog.getProducts({
      filters: true,
      q,
      f: 'tags!:combo',
      pageSize: 20,
    });
    return res.json(response);
  } catch (error) {
    logger.error(`error getSearchProducts ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const getSearchCollections = async (req, res, next) => {
  const { application_id } = req.params;
  const { q } = req.query;

  try {
    if (!application_id) {
      throw new Error('Unknown application id');
    }

    const { platformClient } = req;
    const { token } = await platformClient
      .application(application_id)
      .configuration.getApplicationById();
    const applicationClient = await fdkExtension.getApplicationClient(
      application_id,
      token,
    );
    const response = await applicationClient.catalog.getCollections({
      q,
      pageSize: 20,
    });
    return res.json(response);
  } catch (error) {
    logger.error(`error getSearchCollections ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = {
  getSearchProducts,
  getSearchCollections,
};
