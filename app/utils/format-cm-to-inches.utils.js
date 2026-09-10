/**
 * Converts a measurement in centimeters to a formatted string
 * showing both centimeters and inches.
 *
 * @param {number} cm - The measurement in centimeters.
 * @returns {string|null} - A formatted string like "47.00 cm (18.50\")" or null if invalid input.
 */
const formatCmToInches = (cm) => {
  if (typeof cm !== "number" || isNaN(cm)) return null;

  const inches = cm / 2.54;
  const cmStr = Math.ceil(cm);
  const inchStr = inches.toFixed(2);

  return `${cmStr} cm (${inchStr}")`;
};

module.exports = { formatCmToInches };
