const _ = require('lodash');
const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const ConfigModel = require('../../models/config.model');

const getCompanySalesChannels = async (req, res, next) => {
  const { company_id: companyId } = req.fdkSession;
  try {
    const { platformClient } = req;
    let allConfigs = await ConfigModel.find({ company_id: companyId })
      .select('application_id')
      .lean()
      .exec();
    let applicationList = await platformClient.configuration.getApplications({
      pageSize: 999,
    });
    if (applicationList.items.length > 0) {
      logger.info(`Fetched sales channels for company id ${companyId}`);
      let appsDict = _.keyBy(allConfigs, 'application_id');
      applicationList.items = applicationList.items.map((item) => {
        let appConfig = appsDict[item._id];
        return {
          ...item,
          isDYConfigured: appConfig ? true : false,
        };
      });
    }
    return res.json(applicationList);
  } catch (error) {
    logger.error(`error fetching sales channels for company id ${companyId}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const getApplicationDetails = async (req, res, next) => {
  const { company_id } = req.fdkSession;
  let { application_id = '' } = req.params;
  try {
    const { platformClient } = req;
    if (application_id === '') {
      throw new Error('Unknown sales channel');
    }
    let appDetails = await platformClient
      .application(application_id)
      .configuration.getAppBasicDetails();
    return res.json(appDetails);
  } catch (error) {
    logger.error(`error fetching sales channels for company id ${company_id}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = { getCompanySalesChannels, getApplicationDetails };
