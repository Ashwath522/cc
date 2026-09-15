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

const fs = require('fs');
const path = require('path');

function getRawCategoryProducts({ categoryIds = [], pageSize = 50 }) {
  try {
    const trainingDir = path.join(__dirname, '../../../data/trainingSet');
    if (!fs.existsSync(trainingDir)) {
      return [];
    }

    const CATEGORY_MAP = {
      'beds': 'beds_generated_enriched',
      'bed': 'beds_generated_enriched',
      'bedroom storage': 'bedroom_storage_generated_enriched',
      'storage': 'bedroom_storage_generated_enriched',
      'mattresses': 'mattresses_generated_enriched',
      'mattress': 'mattresses_generated_enriched',
      'wardrobes': 'wardrobes_generated_enriched',
      'wardrobe': 'wardrobes_generated_enriched',
      'kids room': 'kids_room_generated_enriched',
      'kids': 'kids_room_generated_enriched',
      'pet furniture': 'pet_furniture_generated_enriched',
    };

    const requested = Array.isArray(categoryIds) ? categoryIds : [categoryIds];
    const catKey = (requested[0] || 'beds').toString().toLowerCase().trim();
    const prefix = CATEGORY_MAP[catKey] || 'beds_generated_enriched';

    const files = fs.readdirSync(trainingDir);
    const matchedFile = files.find((f) => f.startsWith(prefix) && f.endsWith('.jsonl') && !f.includes('.bak')) ||
      files.find((f) => f.startsWith('beds_generated_enriched') && !f.includes('.bak'));

    if (!matchedFile) {
      return [];
    }

    const filePath = path.join(trainingDir, matchedFile);
    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n').filter(Boolean);
    const items = [];

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        const raw = parsed.input || parsed;
        if (!raw.id && !raw.name) continue;

        items.push({
          uid: raw.id || raw.item_code,
          item_code: raw.item_code || raw.id,
          name: raw.name,
          slug: raw.slug || raw.id,
          product_short_name: raw.product_short_name || (raw.name ? raw.name.split(/\s+/)[0] : 'Product'),
          category: raw.category || 'Bedroom',
          subcategory: raw.subcategory || requested[0] || 'Beds',
          primary_material: raw.primary_material,
          secondary_material: raw.secondary_material,
          seating_capacity: raw.seating_capacity,
          color_finish: raw.color_finish || raw.finish_name,
          storage_type: raw.storage_type,
          variant_axes: raw.variant_axes || {},
          mattress_recommendation: raw.mattress_recommendation,
          dimensions: raw.dimensions,
          weight: raw.weight,
          warranty_months: raw.warranty_months !== undefined ? raw.warranty_months : 12,
          price: raw.price || 19999,
          design_details: raw.design_details || 'refined contemporary aesthetic',
        });

        if (items.length >= pageSize) break;
      } catch (e) {}
    }

    return items;
  } catch (err) {
    logger.error(`[getRawCategoryProducts] Failed reading raw category products: ${err.message}`);
    return [];
  }
}

const getProductsByCategoryPaginated = async ({
  companyId,
  categoryIds,
  pageSize = 50,
  pageId = '*',
  allowSeedFallback = true,
  catalogSource = null,
}) => {
  if (catalogSource === 'raw_catalog') {
    logger.info(`[getProductsByCategoryPaginated] Using raw catalog source for categoryIds: ${JSON.stringify(categoryIds)}`);
    const rawItems = getRawCategoryProducts({ categoryIds, pageSize });
    return {
      items: rawItems,
      page: { has_next: false, current: 1, item_total: rawItems.length },
    };
  }

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
    if (response?.items && response.items.length > 0) {
      return {
        items: response.items,
        page: response?.page || {},
      };
    }
  } catch (error) {
    logger.error(`[getProductsByCategoryPaginated] Platform client unavailable or empty (${error.message}).`);
    if (allowSeedFallback === false) {
      throw new Error(`[getProductsByCategoryPaginated] FYND PLATFORM FETCH FAILED: ${error.message}. allowSeedFallback is false; aborting.`);
    }
    logger.error(`[getProductsByCategoryPaginated] Fallback to raw catalog products taken.`);
  }

  const seeded = getRawCategoryProducts({ categoryIds, pageSize });
  return {
    items: seeded,
    page: { has_next: false, current: 1, item_total: seeded.length },
  };
};

module.exports = {
  getProductsBySKUs,
  getProductsBySKUsInBatches,
  catalogItemToProductRef,
  getProductSizesBySlug,
  getProductsByCategoryPaginated,
  getRawCategoryProducts,
};


