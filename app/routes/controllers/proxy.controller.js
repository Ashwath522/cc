'use strict';
const urlJoin = require('url-join');
const logger = require('../../common/logger');
const config = require('../../common/config');
const ConfigModel = require('../../models/config.model');

const addProxyController = async (req, res, next) => {
  try {
    const { platformClient } = req;

    const applicationId = req.params.application_id;

    const { company_id: companyId } = req.fdkSession;

    const addProxyResponse = await platformClient
      .application(applicationId)
      .partner.addProxyPath({
        extensionId: platformClient.config.apiKey,
        body: {
          attached_path: config.APP_IDENTIFIER,
          proxy_url: urlJoin(config.BROWSER_CONFIG.HOST_MAIN_URL, `/proxy`),
        },
      });
    logger.info('addProxy', addProxyResponse);
    await ConfigModel.findOneAndUpdate(
      {
        company_id: companyId,
        application_id: applicationId,
      },
      {
        $set: {
          is_proxy_added: true,
        },
      },
      {
        upsert: true,
      },
    ).exec();
    return res.json({ message: 'Proxy Added Successfully.' });
  } catch (e) {
    logger.error('addProxy', e);
    next(e);
  }
};

const removeProxyController = async (req, res, next) => {
  try {
    const { platformClient } = req;

    const applicationId = req.params.application_id;

    const removeProxyResponse = await platformClient
      .application(applicationId)
      .partner.removeProxyPath({
        extensionId: platformClient.config.apiKey,
        attachedPath: config.APP_IDENTIFIER,
      });
    logger.info('removeProxy', removeProxyResponse);
    await ConfigModel.findOneAndUpdate(
      {
        company_id: companyId,
        application_id: applicationId,
      },
      {
        $set: {
          is_proxy_added: false,
        },
      },
      {
        upsert: true,
      },
    ).exec();
    return res.json({ message: 'Proxy Removed Successfully.' });
  } catch (e) {
    logger.error('removeProxy', e);
    next(e);
  }
};

module.exports = { addProxyController, removeProxyController };
