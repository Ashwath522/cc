const logger = require("../../common/logger");
const {
  fdkExtension: { getPlatformClient, getApplicationClient },
} = require("../../fdk");
const { BULK_IMPORT_PRODUCT_SKU_BATCH_SIZE } = require("../../constants/constant");
const { normalizeRelationFieldValue } = require("../../helpers/dynamic-collection.helper");

const getProductsBySKUs = async ({ skus, companyId }) => {
  const platformClient = await getPlatformClient(companyId);
  const productResponse = await platformClient.catalog.getProducts({
    itemCode: skus,
    pageSize: skus.length,
  });
  return productResponse?.items || [];
};

const catalogItemToProductRef = (item) => {
  if (!item || typeof item !== "object") {
    return null;
  }
  return normalizeRelationFieldValue({
    uid: item.uid,
    slug: item.slug || item.category_slug || "",
    name: item.name || item.title || "",
  });
};

const getProductsBySKUsInBatches = async ({
  skus,
  companyId,
  batchSize = BULK_IMPORT_PRODUCT_SKU_BATCH_SIZE,
}) => {
  const unique = [...new Set((skus || []).map((s) => `${s}`.trim()).filter(Boolean))];
  const map = new Map();
  if (!unique.length) {
    return map;
  }

  const size = Math.max(1, batchSize || BULK_IMPORT_PRODUCT_SKU_BATCH_SIZE);
  for (let i = 0; i < unique.length; i += size) {
    const chunk = unique.slice(i, i + size);
    const items = await getProductsBySKUs({ skus: chunk, companyId });
    for (const item of items) {
      const code = item && item.item_code != null ? `${item.item_code}`.trim() : "";
      if (!code) {
        continue;
      }
      const key = code.toLowerCase();
      if (!map.has(key)) {
        map.set(key, item);
      }
    }
  }
  return map;
};

const getProductSizesBySlug = async ({ slug, companyId, applicationId }) => {
  try {
    const platformClient = await getPlatformClient(companyId);
    const { token } = await platformClient
      .application(applicationId)
      .configuration.getApplicationById();

    const applicationClient = await getApplicationClient(applicationId, token);

    const productResponse =
      await applicationClient.catalog.getProductSizesBySlug({ slug });

    return productResponse;
  } catch (error) {
    logger.error(`[getProductSizesBySlug] Error: ${error.message}`);
    throw new Error("Failed to fetch product info");
  }
};

const getProductsByCategoryPaginated = async ({
  companyId,
  categoryIds,
  pageSize = 50,
  pageId = '*',
}) => {
  try {
    const platformClient = await getPlatformClient(companyId);
    const query = {
      pageSize: Math.max(1, pageSize),
    };
    if (pageId && pageId !== '') {
      query.pageId = pageId;
    }
    if (categoryIds) {
      const cats = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
      if (cats.length > 0) {
        query.categoryIds = cats;
      }
    }
    const response = await platformClient.catalog.getProducts(query);
    return {
      items: response?.items || [],
      page: response?.page || {},
    };
  } catch (error) {
    logger.error(`[getProductsByCategoryPaginated] Error: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getProductsBySKUs,
  getProductsBySKUsInBatches,
  catalogItemToProductRef,
  getProductSizesBySlug,
  getProductsByCategoryPaginated,
};

