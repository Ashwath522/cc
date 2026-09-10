const { ERROR_CODES } = require("../../constants/error-codes.constant");
const { buildExcelError } = require("../helper.utils");

const runValidationRules = (row, rules) => {
  const errors = [];

  for (const rule of rules) {
    const { field, validator, args = null, errorCode, errorMeta = null } = rule;

    const value = row[field];
    const isValid = validator(value, args);

    if (!isValid) {
      errors.push(buildExcelError(ERROR_CODES[errorCode], errorMeta));
    }
  }

  return errors;
};

module.exports = { runValidationRules };
