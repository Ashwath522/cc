const validators = {
  // Case-insensitive enum matcher
  enumRelaxed(value, list) {
    if (!value) return false;
    return list.some(
      (item) => item.toLowerCase() === value.toString().trim().toLowerCase()
    );
  },

  // Exact enum matcher (case-sensitive)
  enumStrict(value, list) {
    if (!value) return false;
    return list.includes(value);
  },

  // Required field check
  required(value) {
    return (
      value !== undefined && value !== null && value.toString().trim() !== ""
    );
  },

  // Required + must be a non-empty string
  requiredString(value) {
    return typeof value === "string" && value.trim().length > 0;
  },

  // Number validator
  isNumber(value) {
    return typeof value === "number" && !isNaN(value);
  },

  // Positive integer check
  isPositiveInt(value) {
    return Number.isInteger(Number(value)) && Number(value) > 0;
  },

  // Required + must be a positive number (int or float)
  requiredPositiveNumber(value) {
    const num = Number(value);
    return value !== undefined && value !== null && !isNaN(num) && num > 0;
  },

  // Min/max range
  inRange(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // Regex validator
  matches(value, regex) {
    if (!value) return false;
    return regex.test(value.toString());
  },

  // Length range
  lengthBetween(value, min, max) {
    if (!value) return false;
    const len = value.toString().trim().length;
    return len >= min && len <= max;
  },
};

module.exports = { validators };
