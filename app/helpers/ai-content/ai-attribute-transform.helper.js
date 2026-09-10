'use strict';

/**
 * Normalizes a raw Fynd catalog item into the standardized flat attribute format
 * expected by prompt builder, validator, and orchestrator.
 */
function transformCatalogItemToProduct(rawItem) {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  // If item is already in standardized format, pass through with safe defaults
  const isStandardized = rawItem.primary_material !== undefined || rawItem.dimensions !== undefined;
  const attributes = rawItem.attributes || {};

  const name = rawItem.name || rawItem.title || rawItem.item_name || '';
  const itemCode = rawItem.item_code || rawItem.code || rawItem.id || '';
  const uid = rawItem.uid || rawItem._id || itemCode;

  // Extract short name fallback (first distinctive word)
  let shortName = rawItem.product_short_name || attributes.product_short_name;
  if (!shortName && name) {
    shortName = name.split(/\s+/)[0];
  }

  // Price extraction
  let price = rawItem.price;
  if (typeof price === 'object' && price !== null) {
    price = price.effective?.min ?? price.effective ?? price.marked?.min ?? price.marked ?? 0;
  }
  price = Number(price) || 0;

  // Warranty months
  let warrantyMonths = rawItem.warranty_months ?? attributes.warranty_months;
  if (warrantyMonths !== undefined && warrantyMonths !== null) {
    warrantyMonths = Number(warrantyMonths);
  } else if (rawItem.warranty !== undefined && rawItem.warranty !== null) {
    warrantyMonths = typeof rawItem.warranty === 'number' ? rawItem.warranty : (rawItem.warranty ? 12 : 0);
  } else {
    warrantyMonths = null;
  }

  // Dimensions
  let dimensions = rawItem.dimensions || attributes.dimensions || '';
  if (!dimensions && (attributes.length || attributes.width || attributes.height)) {
    const l = attributes.length ? `Length ${attributes.length}` : '';
    const w = attributes.width ? `Width ${attributes.width}` : '';
    const h = attributes.height ? `Height ${attributes.height}` : '';
    dimensions = [l, w, h].filter(Boolean).join(' x ');
  }

  // Category determination
  let category = rawItem.category || rawItem.category_slug || attributes.category || 'Default';
  if (typeof category === 'object' && category !== null) {
    category = category.name || category.slug || 'Default';
  }

  const variantAxes = rawItem.variant_axes || attributes.variant_axes || {
    size: rawItem.available_sizes || [],
    storage_type: [],
    finish: rawItem.available_colors || [],
    colour: rawItem.available_colors || [],
  };

  return {
    id: String(uid),
    uid: String(uid),
    item_code: String(itemCode),
    name,
    product_short_name: shortName || name,
    category: String(category),
    subcategory: rawItem.subcategory || attributes.subcategory || String(category),
    price,
    dimensions: String(dimensions || ''),
    primary_material: String(rawItem.primary_material || attributes.primary_material || attributes.primary_material_type || ''),
    secondary_material: String(rawItem.secondary_material || attributes.secondary_material || ''),
    weight: String(rawItem.weight || attributes.weight || ''),
    assembly_required: String(rawItem.assembly_required || attributes.assembly_required || ''),
    warranty_months: warrantyMonths,
    seating_capacity: String(rawItem.seating_capacity || attributes.seating_capacity || ''),
    color_finish: String(rawItem.color_finish || attributes.color_finish || attributes.finish || attributes.colour || ''),
    primary_color: String(rawItem.primary_color || attributes.primary_color || attributes.colour || ''),
    finish_name: String(rawItem.finish_name || attributes.finish_name || attributes.finish || ''),
    size_of_the_bed: String(rawItem.size_of_the_bed || attributes.size_of_the_bed || ''),
    storage_type: String(rawItem.storage_type || attributes.storage_type || ''),
    available_sizes: Array.isArray(rawItem.available_sizes) ? rawItem.available_sizes : (variantAxes.size || []),
    available_colors: Array.isArray(rawItem.available_colors) ? rawItem.available_colors : (variantAxes.colour || variantAxes.finish || []),
    variant_axes: variantAxes,
    mattress_recommendation: rawItem.mattress_recommendation || attributes.mattress_recommendation || null,
    recommended_mattress_size: rawItem.recommended_mattress_size || attributes.recommended_mattress_size || '',
    slug: rawItem.slug || rawItem.category_slug || '',
    raw: rawItem,
  };
}

module.exports = { transformCatalogItemToProduct };
