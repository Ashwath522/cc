'use strict';

const _ = require('lodash');
const slugify = require('slugify');
const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const ObjectDefinitionModel = require('../../models/objectDefinition.model');
const ObjectDefinitionVersionModel = require('../../models/objectDefinitionVersion.model');
const {
  invalidateDefinitionCache,
} = require('../../helpers/schema-cache.helper');
const { getDynamicModel } = require('../../helpers/dynamic-collection.helper');
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

const normalizeUsageMode = (usageMode) => {
  return usageMode === 'embedded_only' ? 'embedded_only' : 'standalone';
};

const createObjectDefinition = async (req, res, next) => {
  const { companyId, applicationId } = getRequestContext(req);
  const { name, slug, description, fields = [], usage_mode } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Object definition name is required' });
  }

  if (!applicationId) {
    return res.status(400).json({ message: 'application_id is required' });
  }

  const normalizedSlug = slugify(slug || name, { lower: true, strict: true });

  try {
    const existing = await ObjectDefinitionModel.findOne({
      company_id: companyId,
      application_id: applicationId,
      slug: normalizedSlug,
    });

    if (existing) {
      return res.status(409).json({ message: 'Object definition slug already exists' });
    }

    const definition = new ObjectDefinitionModel({
      company_id: companyId,
      application_id: applicationId,
      name,
      slug: normalizedSlug,
      description: description || '',
      usage_mode: normalizeUsageMode(usage_mode),
      fields,
      created_by: getRequestUser(req),
      updated_by: getRequestUser(req),
    });

    await definition.save();

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

    return res.status(201).json(definition);
  } catch (error) {
    logger.error(`createObjectDefinition error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const listObjectDefinitions = async (req, res, next) => {
  const { companyId, applicationId } = getRequestContext(req);

  try {
    const definitions = await ObjectDefinitionModel.find({
      company_id: companyId,
      application_id: applicationId,
    })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    return res.json(definitions);
  } catch (error) {
    logger.error(`listObjectDefinitions error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const getObjectDefinition = async (req, res, next) => {
  const { companyId, applicationId } = getRequestContext(req);
  const { definitionId } = req.params;

  try {
    const definition = await ObjectDefinitionModel.findOne({
      _id: definitionId,
      company_id: companyId,
      application_id: applicationId,
    }).lean();

    if (!definition) {
      return res.status(404).json({ message: 'Object definition not found' });
    }

    return res.json(definition);
  } catch (error) {
    logger.error(`getObjectDefinition error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const updateObjectDefinition = async (req, res, next) => {
  const { companyId, applicationId } = getRequestContext(req);
  const { definitionId } = req.params;
  const { name, slug, description, fields = [], usage_mode } = req.body;

  try {
    const definition = await ObjectDefinitionModel.findOne({
      _id: definitionId,
      company_id: companyId,
      application_id: applicationId,
    });

    if (!definition) {
      return res.status(404).json({ message: 'Object definition not found' });
    }

    const normalizedSlug = slugify(slug || name || definition.name, {
      lower: true,
      strict: true,
    });

    if (normalizedSlug !== definition.slug) {
      const existing = await ObjectDefinitionModel.findOne({
        company_id: companyId,
        application_id: applicationId,
        slug: normalizedSlug,
        _id: { $ne: definitionId },
      });
      if (existing) {
        return res.status(409).json({ message: 'Object definition slug already exists' });
      }
    }

    definition.name = name || definition.name;
    definition.slug = normalizedSlug;
    definition.description = description || definition.description;
    definition.usage_mode = normalizeUsageMode(usage_mode || definition.usage_mode);
    definition.fields = fields;
    definition.status = 'DRAFT';
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
    logger.error(`updateObjectDefinition error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const getDefinitionDeletionImpact = async (req, res, next) => {
  const { companyId, applicationId } = getRequestContext(req);
  const { definitionId } = req.params;

  try {
    const definition = await ObjectDefinitionModel.findOne({
      _id: definitionId,
      company_id: companyId,
      application_id: applicationId,
    }).lean();

    if (!definition) {
      return res.status(404).json({ message: 'Object definition not found' });
    }

    const referencedBy = await ObjectDefinitionModel.find({
      company_id: companyId,
      application_id: applicationId,
      _id: { $ne: definition._id },
      'fields.ref_definition_slug': definition.slug,
    })
      .select('name slug')
      .lean()
      .exec();

    let entryCount = 0;
    try {
      const Model = getDynamicModel(definition);
      entryCount = await Model.countDocuments({
        company_id: companyId,
        application_id: applicationId,
      });
    } catch (countErr) {
      logger.warn(
        `getDefinitionDeletionImpact count failed for ${definition.slug}: ${countErr.message}`,
      );
    }

    return res.json({
      slug: definition.slug,
      name: definition.name,
      entry_count: entryCount,
      referenced_by: referencedBy.map((d) => ({ slug: d.slug, name: d.name })),
    });
  } catch (error) {
    logger.error(`getDefinitionDeletionImpact error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const deleteObjectDefinition = async (req, res, next) => {
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

    const referencing = await ObjectDefinitionModel.find({
      company_id: companyId,
      application_id: applicationId,
      _id: { $ne: definition._id },
      'fields.ref_definition_slug': definition.slug,
    })
      .select('name slug')
      .lean()
      .exec();

    if (referencing.length > 0) {
      return res.status(409).json({
        message:
          'This definition cannot be deleted because it is used as an embedded custom object type on other definition(s). Remove or change those fields first.',
        referenced_by: referencing.map((d) => ({ slug: d.slug, name: d.name })),
      });
    }

    try {
      const Model = getDynamicModel(definition.toObject());
      await Model.deleteMany({
        company_id: companyId,
        application_id: applicationId,
      });
    } catch (clearErr) {
      logger.warn(`deleteObjectDefinition: could not clear entries for ${definition.slug}: ${clearErr.message}`);
    }

    await ObjectDefinitionVersionModel.deleteMany({
      definition_id: definition._id,
      company_id: companyId,
      application_id: applicationId,
    });

    const slug = definition.slug;
    await definition.deleteOne();
    await invalidateDefinitionCache(companyId, applicationId, slug);
    return res.status(204).send();
  } catch (error) {
    logger.error(`deleteObjectDefinition error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

module.exports = {
  createObjectDefinition,
  listObjectDefinitions,
  getObjectDefinition,
  getDefinitionDeletionImpact,
  updateObjectDefinition,
  deleteObjectDefinition,
};
