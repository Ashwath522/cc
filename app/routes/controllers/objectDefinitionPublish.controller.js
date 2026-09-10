'use strict';

const _ = require('lodash');
const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const ObjectDefinitionModel = require('../../models/objectDefinition.model');
const ObjectDefinitionVersionModel = require('../../models/objectDefinitionVersion.model');
const {
  invalidateDefinitionCache,
} = require('../../helpers/schema-cache.helper');
const {
  getCompanyId,
  getApplicationId,
} = require('../../helpers/request-context.helper');

const getRequestUser = (req) => {
  return _.get(req, 'fdkSession.current_user.email', '') || _.get(req, 'fdkSession.current_user.id', '');
};

const getRequestContext = (req) => {
  return { companyId: getCompanyId(req), applicationId: getApplicationId(req) };
};

const publishObjectDefinition = async (req, res, next) => {
  const { companyId, applicationId } = getRequestContext(req);
  const { definitionId } = req.params;

  try {
    const definition = await ObjectDefinitionModel.findOne({
      _id: definitionId,
      company_id: companyId,
      application_id: applicationId,
    });

    if (!definition) {
      return res.status(404).json({ message: 'Object definition not found' });
    }

    definition.status = 'PUBLISHED';
    definition.published_at = new Date();
    definition.version = (definition.version || 1) + 1;
    definition.updated_by = getRequestUser(req);

    await definition.save();
    await invalidateDefinitionCache(companyId, applicationId, definition.slug);

    const version = new ObjectDefinitionVersionModel({
      company_id: companyId,
      application_id: applicationId,
      definition_id: definition._id,
      version: definition.version,
      status: definition.status,
      snapshot: definition.toObject(),
      created_by: getRequestUser(req),
    });
    await version.save();

    return res.json(definition);
  } catch (error) {
    logger.error(`publishObjectDefinition error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const listObjectDefinitionVersions = async (req, res, next) => {
  const { companyId, applicationId } = getRequestContext(req);
  const { definitionId } = req.params;

  try {
    const versions = await ObjectDefinitionVersionModel.find({
      definition_id: definitionId,
      company_id: companyId,
      application_id: applicationId,
    })
      .sort({ version: -1 })
      .lean()
      .exec();

    return res.json(versions);
  } catch (error) {
    logger.error(`listObjectDefinitionVersions error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = {
  publishObjectDefinition,
  listObjectDefinitionVersions,
};
