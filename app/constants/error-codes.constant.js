const ERROR_CODES = {
  INVALID_SKU_CODE: {
    code: "INVALID_SKU_CODE",
    message: "Missing or invalid sku_code",
  },

  INVALID_TOTAL_TAG_QTY: {
    code: "INVALID_TOTAL_TAG_QTY",
    message: "total_tag_qty must be a positive integer",
  },

  INVALID_TAG_TYPE: {
    code: "INVALID_TAG_TYPE",
    message: (allowed) => `tag_type must be one of: ${allowed.join(", ")}`,
  },

  INVALID_TEMPLATE_NAME: {
    code: "INVALID_TEMPLATE_NAME",
    message: (allowed) => `template_name must be one of: ${allowed.join(", ")}`,
  },
};

module.exports = { ERROR_CODES };
