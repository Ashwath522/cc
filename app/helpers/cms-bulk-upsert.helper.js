'use strict';

const {
  validateObjectData,
  applyInstanceSlugToPayload,
  isDuplicateInstanceSlugError,
  resolveInstanceSlugSourceField,
} = require('./dynamic-collection.helper');

const isEmptyPatchValue = (value) => {
  if (value === undefined || value === null) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
};

/**
 * Merge spreadsheet patch onto an existing document; empty/missing patch fields keep existing values.
 */
const mergePartialPayloadIntoExisting = (existingDoc, patchPayload) => {
  const merged = { ...(existingDoc || {}) };
  delete merged._id;
  delete merged.__v;
  delete merged.createdAt;
  delete merged.updatedAt;

  Object.entries(patchPayload || {}).forEach(([key, value]) => {
    if (['application_id', 'company_id'].includes(key)) {
      return;
    }
    if (isEmptyPatchValue(value)) {
      return;
    }
    merged[key] = value;
  });

  if (patchPayload.application_id) {
    merged.application_id = patchPayload.application_id;
  }
  if (patchPayload.company_id) {
    merged.company_id = patchPayload.company_id;
  }

  return merged;
};

const buildTenantQuery = (companyId, applicationId, extra = {}) => ({
  company_id: companyId,
  application_id: applicationId,
  ...extra,
});

/**
 * Find existing CMS instance for a bulk-import row (by instance slug or single product uid).
 */
const findExistingInstanceForBulkRow = async (Model, payload, definition, companyId, applicationId) => {
  const slug = payload.slug != null ? `${payload.slug}`.trim() : '';
  if (slug) {
    const bySlug = await Model.findOne(buildTenantQuery(companyId, applicationId, { slug }))
      .lean()
      .exec();
    if (bySlug) {
      return bySlug;
    }
  }

  const sourceField = resolveInstanceSlugSourceField(definition);
  if (sourceField && payload[sourceField] && payload[sourceField].uid) {
    const uid = payload[sourceField].uid;
    const byProductUid = await Model.findOne(
      buildTenantQuery(companyId, applicationId, {
        [`${sourceField}.uid`]: uid,
      }),
    )
      .lean()
      .exec();
    if (byProductUid) {
      return byProductUid;
    }
  }

  return null;
};

/**
 * Create or partially update a CMS instance from a bulk-import payload.
 */
const upsertBulkImportRow = async ({ Model, payload, definition, companyId, applicationId }) => {
  applyInstanceSlugToPayload(payload, definition);

  let existing = await findExistingInstanceForBulkRow(
    Model,
    payload,
    definition,
    companyId,
    applicationId,
  );

  if (existing) {
    const merged = mergePartialPayloadIntoExisting(existing, payload);
    applyInstanceSlugToPayload(merged, definition);
    const validation = validateObjectData(merged, definition);
    if (!validation.valid) {
      return { ok: false, error: validation.error };
    }
    const document = await Model.findOneAndUpdate(
      buildTenantQuery(companyId, applicationId, { _id: existing._id }),
      merged,
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
    if (!document) {
      return { ok: false, error: 'Existing object could not be updated' };
    }
    return { ok: true, id: String(document._id), updated: true };
  }

  const validation = validateObjectData(payload, definition);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  try {
    const document = await Model.create(payload);
    return { ok: true, id: String(document._id), updated: false };
  } catch (err) {
    if (!isDuplicateInstanceSlugError(err)) {
      throw err;
    }
    existing = await findExistingInstanceForBulkRow(
      Model,
      payload,
      definition,
      companyId,
      applicationId,
    );
    if (!existing) {
      return { ok: false, error: 'An object with this slug already exists' };
    }
    const merged = mergePartialPayloadIntoExisting(existing, payload);
    applyInstanceSlugToPayload(merged, definition);
    const revalidation = validateObjectData(merged, definition);
    if (!revalidation.valid) {
      return { ok: false, error: revalidation.error };
    }
    const document = await Model.findOneAndUpdate(
      buildTenantQuery(companyId, applicationId, { _id: existing._id }),
      merged,
      { new: true, runValidators: true },
    )
      .lean()
      .exec();
    if (!document) {
      return { ok: false, error: 'Existing object could not be updated after duplicate slug' };
    }
    return { ok: true, id: String(document._id), updated: true };
  }
};

module.exports = {
  mergePartialPayloadIntoExisting,
  findExistingInstanceForBulkRow,
  upsertBulkImportRow,
};
