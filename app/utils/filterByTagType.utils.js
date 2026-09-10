const { TEMPLATE_TAG_TYPE } = require("../constants/constant");

/**
 * Filters an array of data points by a given tag type key.
 *
 * @param {Array} data - The array of items (each having a tag_type property).
 * @param {string} [typeKey='PRODUCT_TAG'] - The key from TEMPLATE_TAG_TYPE to compare against.
 * @returns {Array} - Filtered items matching the given tag type.
 */
const filterByTagType = (data, typeKey = "PRODUCT_TAG") => {
  if (!Array.isArray(data)) return [];

  const compareTo = TEMPLATE_TAG_TYPE?.[typeKey];
  if (!compareTo) return [];

  return data.filter(
    (item) => item?.tag_type?.toLowerCase() === compareTo?.toLowerCase()
  );
};

module.exports = { filterByTagType };
