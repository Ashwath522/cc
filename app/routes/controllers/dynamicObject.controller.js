'use strict';

const fsp = require('fs').promises;
const _ = require('lodash');
const Sentry = require('@sentry/node');
const logger = require('../../common/logger');
const ObjectDefinitionModel = require('../../models/objectDefinition.model');
const {
  getDynamicModel,
  mergeTenantScope,
  validateObjectData,
  buildFilterQuery,
  normalizeRelationFieldValue,
  normalizeEmbeddedCustomObjectInput,
  normalizeEmbeddedCustomObjectArrayInput,
  applyInstanceSlugToPayload,
  isDuplicateInstanceSlugError,
} = require('../../helpers/dynamic-collection.helper');
const {
  getApplicationId,
  getCompanyId,
} = require('../../helpers/request-context.helper');
const {
  getDefinitionFromCache,
  setDefinitionCache,
} = require('../../helpers/schema-cache.helper');
const { uploadFileUtils } = require('../../utils/uploadFile.utils');
const { validateMulterFileAgainstField } = require('../../helpers/cms-file-field.helper');
const { applyEmbeddedFileUploadsToPayload } = require('../../helpers/cms-embedded-file-upload.helper');
const {
  getBulkImportableFields,
  rowObjectToPayload,
  parseWorkbookToRows,
  isRowEffectivelyEmpty,
  buildTemplateWorkbook,
  buildTemplateCsv,
  unlinkSafe,
} = require('../../helpers/cms-bulk-import.helper');
const {
  collectProductSkusFromRows,
  buildProductSkuMap,
  resolveProductFieldsOnPayload,
} = require('../../helpers/cms-bulk-product-resolve.helper');
const { upsertBulkImportRow } = require('../../helpers/cms-bulk-upsert.helper');

const collectCustomObjectRefSlugs = (definition) => {
  const slugs = [];
  (definition.fields || []).forEach((f) => {
    if (f && f.field_type === 'custom_object' && f.ref_definition_slug) {
      slugs.push(String(f.ref_definition_slug).trim());
    }
  });
  return slugs.filter(Boolean);
};

/**
 * Load all published child definitions referenced by custom_object fields (recursively) for bulk templates.
 */
const loadChildDefinitionsForTemplate = async (definition, companyId, applicationId) => {
  const bySlug = {};
  const queue = [...new Set(collectCustomObjectRefSlugs(definition))];
  while (queue.length) {
    const slug = queue.shift();
    if (!slug || bySlug[slug]) {
      continue;
    }
    const child = await ObjectDefinitionModel.findOne({
      company_id: companyId,
      application_id: applicationId,
      slug,
      status: 'PUBLISHED',
    })
      .lean()
      .exec();
    if (!child) {
      continue;
    }
    bySlug[slug] = child;
    collectCustomObjectRefSlugs(child).forEach((s) => {
      if (s && !bySlug[s]) {
        queue.push(s);
      }
    });
  }
  return bySlug;
};

const findPublishedDefinition = async (companyId, applicationId, slug) => {
  const cached = await getDefinitionFromCache(companyId, applicationId, slug);
  if (cached) {
    return cached;
  }

  const definition = await ObjectDefinitionModel.findOne({
    company_id: companyId,
    application_id: applicationId,
    slug,
    status: 'PUBLISHED',
  })
    .lean()
    .exec();

  if (!definition) {
    return null;
  }

  await setDefinitionCache(companyId, applicationId, slug, definition);
  return definition;
};

const loadDefinition = async (req, res, next, slug) => {
  const companyId = getCompanyId(req);
  const applicationId = getApplicationId(req);

  try {
    const definition = await findPublishedDefinition(companyId, applicationId, slug);
    if (!definition) {
      return res.status(404).json({ message: 'Published object definition not found' });
    }

    req.definition = definition;
    return next();
  } catch (error) {
    logger.error(`loadDefinition error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

// '/cms/definitions' is a reserved literal path (CMS definition management, see v1.router.js)
// that would otherwise collide with the :slug wildcard below - always defer to the
// authenticated route for it.
const RESERVED_CMS_SLUGS = new Set(['definitions']);

/**
 * Registered on the Express app ahead of fdkExtension.apiRoutes (see app/server.js), so it
 * only intercepts GET /api/v1/cms/:slug when x-application-data is present; otherwise it
 * calls next() and falls through to the original FDK session-gated route, unchanged.
 * Works for any published object definition's slug, not just one - company_id and
 * application_id are trusted from that header only, with no fallback and no signature
 * verification. All other CMS routes (writes, definition management, bulk import) are
 * untouched and remain fully session-gated.
 */
const publicListObjectInstances = async (req, res, next) => {
  const { slug } = req.params;
  if (RESERVED_CMS_SLUGS.has(slug)) {
    return next();
  }

  const raw = req.headers['x-application-data'];
  if (!raw) {
    return next();
  }

  let applicationId = null;
  let companyId = null;
  try {
    const parsed = JSON.parse(raw);
    applicationId = parsed && parsed._id ? String(parsed._id).trim() : null;
    companyId = parsed && parsed.company_id ? String(parsed.company_id).trim() : null;
  } catch (error) {
    applicationId = null;
    companyId = null;
  }

  if (!applicationId || !companyId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  req.query.company_id = companyId;
  req.query.application_id = applicationId;

  try {
    const definition = await findPublishedDefinition(companyId, applicationId, slug);
    if (!definition) {
      return res.status(404).json({ message: 'Published object definition not found' });
    }
    req.definition = definition;
    return listObjectInstances(req, res, next);
  } catch (error) {
    logger.error(`publicListObjectInstances error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const ensureStandaloneDefinition = (definition, res) => {
  if (!definition || definition.usage_mode !== 'embedded_only') {
    return true;
  }
  res.status(403).json({
    message: 'This object definition is embedded-only and cannot be managed as standalone objects.',
  });
  return false;
};

const normalizeValue = (value, field) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith('{') || trimmedValue.startsWith('[')) {
      try {
        return JSON.parse(trimmedValue);
      } catch (err) {
        return value;
      }
    }

    if (field.field_type === 'multiple_values' && trimmedValue.length > 0) {
      return trimmedValue.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return value;
};

const buildObjectPayload = async (req, definition) => {
  const payload = { ...req.body };
  /* Tenant ids must be scalars from route/query/session — never pass through raw body
   * (multipart duplicate keys or mis-sent arrays would otherwise be persisted). */
  delete payload.application_id;
  delete payload.company_id;
  const companyId = getCompanyId(req);

  if (req.files && req.files.length > 0) {
    const appId = getApplicationId(req);
    if (!appId || typeof appId !== 'string') {
      throw new Error('application_id is required for file uploads and must be a string');
    }
    const platformAppCli = req.platformClient.application(appId);
    const fileFields = definition.fields.filter((field) => field.field_type === 'file');
    for (const field of fileFields) {
      const matchedFiles = req.files.filter((file) => file.fieldname === field.name);
      if (!matchedFiles.length) {
        continue;
      }
      for (const file of matchedFiles) {
        const check = validateMulterFileAgainstField(file, field);
        if (!check.ok) {
          const err = new Error(check.error);
          err.statusCode = 400;
          throw err;
        }
      }
      if (field.multiple) {
        payload[field.name] = await Promise.all(
          matchedFiles.map(async (file) => uploadFileUtils(platformAppCli, file)),
        );
      } else {
        payload[field.name] = await uploadFileUtils(platformAppCli, matchedFiles[0]);
      }
    }

    await applyEmbeddedFileUploadsToPayload({
      files: req.files,
      definition,
      payload,
      companyId,
      applicationId: appId,
      platformAppCli,
    });
  }

  definition.fields.forEach((field) => {
    if (payload[field.name] === undefined) {
      return;
    }
    let normalized = normalizeValue(payload[field.name], field);

    if (field.field_type === 'product' || field.field_type === 'collection') {
      if (field.multiple && Array.isArray(normalized)) {
        normalized = normalized
          .map((item) => normalizeRelationFieldValue(item))
          .filter((x) => x != null);
      } else {
        const ref = normalizeRelationFieldValue(normalized);
        normalized = ref == null ? null : ref;
      }
    } else if (field.field_type === 'custom_object') {
      if (field.multiple) {
        normalized = normalizeEmbeddedCustomObjectArrayInput(normalized);
      } else {
        normalized = normalizeEmbeddedCustomObjectInput(normalized);
      }
    }

    payload[field.name] = normalized;
  });

  const applicationId = getApplicationId(req);
  if (applicationId) {
    payload.application_id = applicationId;
  }
  if (companyId) {
    payload.company_id = companyId;
  }

  applyInstanceSlugToPayload(payload, definition);

  return payload;
};

const createObjectInstance = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }

  try {
    const payload = await buildObjectPayload(req, definition);
    const validation = validateObjectData(payload, definition);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const Model = getDynamicModel(definition);
    const document = await Model.create(payload);
    return res.status(201).json(document);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    if (isDuplicateInstanceSlugError(error)) {
      return res.status(409).json({ message: 'An object with this slug already exists' });
    }
    logger.error(`createObjectInstance error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const listObjectInstances = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }
  const { page = 1, page_size = 20, sort_by = 'createdAt', sort_order = 'desc', slug } = req.query;

  try {
    const Model = getDynamicModel(definition);
    const filters = _.get(req, 'query.filter', {});
    let filterQuery = buildFilterQuery(filters, definition);
    const instanceSlug = slug != null ? `${slug}`.trim() : '';
    if (instanceSlug) {
      filterQuery = { ...filterQuery, slug: instanceSlug };
    }
    const query = mergeTenantScope(
      getCompanyId(req),
      getApplicationId(req),
      filterQuery,
    );
    const pageNumber = Math.max(1, Number(page));
    const pageSizeNumber = Math.min(100, Math.max(1, Number(page_size)));
    const sortDirection = sort_order === 'asc' ? 1 : -1;

    const [total, items] = await Promise.all([
      Model.countDocuments(query),
      Model.find(query)
        .sort({ [sort_by]: sortDirection })
        .skip((pageNumber - 1) * pageSizeNumber)
        .limit(pageSizeNumber)
        .lean()
        .exec(),
    ]);

    return res.json({
      total,
      page: pageNumber,
      page_size: pageSizeNumber,
      items,
    });
  } catch (error) {
    logger.error(`listObjectInstances error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const getObjectInstance = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }
  const { id } = req.params;

  try {
    const Model = getDynamicModel(definition);
    const document = await Model.findOne({
      _id: id,
      company_id: getCompanyId(req),
      application_id: getApplicationId(req),
    })
      .lean()
      .exec();
    if (!document) {
      return res.status(404).json({ message: 'Object instance not found' });
    }
    return res.json(document);
  } catch (error) {
    logger.error(`getObjectInstance error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const updateObjectInstance = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }
  const { id } = req.params;

  try {
    const payload = await buildObjectPayload(req, definition);
    const validation = validateObjectData(payload, definition);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.error });
    }

    const Model = getDynamicModel(definition);
    const document = await Model.findOneAndUpdate(
      {
        _id: id,
        company_id: getCompanyId(req),
        application_id: getApplicationId(req),
      },
      payload,
      {
        new: true,
        runValidators: true,
      },
    )
      .lean()
      .exec();

    if (!document) {
      return res.status(404).json({ message: 'Object instance not found' });
    }

    return res.json(document);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    if (isDuplicateInstanceSlugError(error)) {
      return res.status(409).json({ message: 'An object with this slug already exists' });
    }
    logger.error(`updateObjectInstance error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const deleteObjectInstance = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }
  const { id } = req.params;

  try {
    const Model = getDynamicModel(definition);
    const document = await Model.findOneAndDelete({
      _id: id,
      company_id: getCompanyId(req),
      application_id: getApplicationId(req),
    })
      .lean()
      .exec();
    if (!document) {
      return res.status(404).json({ message: 'Object instance not found' });
    }
    return res.status(204).send();
  } catch (error) {
    logger.error(`deleteObjectInstance error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const getDefinitionBySlug = async (req, res, next) => {
  try {
    if (!req.definition) {
      return res.status(404).json({ message: 'Published object definition not found' });
    }
    return res.json(req.definition);
  } catch (error) {
    logger.error(`getDefinitionBySlug error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const downloadBulkTemplate = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }

  try {
    const importable = getBulkImportableFields(definition);
    if (!importable.length) {
      return res.status(400).json({
        message: 'No bulk-importable fields on this definition. Add fields or use the API.',
      });
    }

    const companyId = getCompanyId(req);
    const applicationId = getApplicationId(req);
    const childDefinitionsBySlug = await loadChildDefinitionsForTemplate(
      definition,
      companyId,
      applicationId,
    );

    const format = `${req.query.format || 'xlsx'}`.toLowerCase();
    const slug = definition.slug || 'template';

    if (format === 'csv') {
      const buf = buildTemplateCsv(definition, childDefinitionsBySlug);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="bulk-template-${slug}.csv"`);
      return res.send(buf);
    }

    if (format === 'xlsx') {
      const buf = buildTemplateWorkbook(definition, childDefinitionsBySlug);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="bulk-template-${slug}.xlsx"`);
      return res.send(buf);
    }

    return res.status(400).json({ message: 'format must be csv or xlsx' });
  } catch (error) {
    logger.error(`downloadBulkTemplate error: ${error.message}`);
    Sentry.captureException(error);
    return next(error);
  }
};

const bulkImportInstances = async (req, res, next) => {
  const definition = req.definition;
  if (!ensureStandaloneDefinition(definition, res)) {
    return;
  }

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'Upload a file using field name "file"' });
  }

  const importable = getBulkImportableFields(definition);
  if (!importable.length) {
    await unlinkSafe(req.file.path);
    return res.status(400).json({ message: 'No bulk-importable fields on this definition.' });
  }

  let buffer;
  try {
    buffer = await fsp.readFile(req.file.path);
  } catch (e) {
    await unlinkSafe(req.file.path);
    return res.status(400).json({ message: 'Could not read uploaded file' });
  }
  await unlinkSafe(req.file.path);

  if (buffer.length && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    buffer = buffer.slice(3);
  }

  let rows;
  try {
    rows = parseWorkbookToRows(buffer, req.file.originalname || '');
  } catch (e) {
    return res.status(400).json({ message: `Could not parse spreadsheet: ${e.message}` });
  }

  if (!rows.length) {
    return res.json({
      created_count: 0,
      failed_count: 0,
      created_ids: [],
      failed: [],
      message: 'No data rows found (add rows under the header).',
    });
  }

  const Model = getDynamicModel(definition);
  const createdIds = [];
  const failed = [];
  const companyId = getCompanyId(req);

  const productSkus = collectProductSkusFromRows(rows, definition);
  let productSkuMap = new Map();
  if (productSkus.size) {
    try {
      productSkuMap = await buildProductSkuMap({
        skus: productSkus,
        companyId,
      });
    } catch (err) {
      logger.error(`bulkImportInstances product SKU lookup error: ${err.message}`);
      Sentry.captureException(err);
      return next(err);
    }
  }

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNum = i + 2;
    if (isRowEffectivelyEmpty(row)) {
      continue;
    }
    try {
      const payload = rowObjectToPayload(row, definition);
      const applicationId = getApplicationId(req);
      if (applicationId) {
        payload.application_id = applicationId;
      }
      if (companyId) {
        payload.company_id = companyId;
      }
      resolveProductFieldsOnPayload({
        payload,
        definition,
        productSkuMap,
      });
      const upsertResult = await upsertBulkImportRow({
        Model,
        payload,
        definition,
        companyId,
        applicationId: getApplicationId(req),
      });
      if (!upsertResult.ok) {
        failed.push({ row: rowNum, message: upsertResult.error });
        continue;
      }
      createdIds.push(upsertResult.id);
    } catch (err) {
      failed.push({
        row: rowNum,
        message: err.message || 'Failed to create row',
      });
    }
  }

  return res.json({
    created_count: createdIds.length,
    failed_count: failed.length,
    created_ids: createdIds,
    failed,
  });
};

module.exports = {
  loadDefinition,
  publicListObjectInstances,
  createObjectInstance,
  listObjectInstances,
  getDefinitionBySlug,
  getObjectInstance,
  updateObjectInstance,
  deleteObjectInstance,
  downloadBulkTemplate,
  bulkImportInstances,
};
