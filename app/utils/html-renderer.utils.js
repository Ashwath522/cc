const Handlebars = require("handlebars");

/**
 * Compiles an HTML template string with the provided data.
 * @param {string} htmlTemplate - The HTML template as a string.
 * @param {object} data - The data to inject into the template.
 * @returns {string} - The rendered HTML.
 */
function renderHtmlTemplate(htmlTemplate, data) {
  if (!htmlTemplate) return "";
  const template = Handlebars.compile(htmlTemplate);
  return template(data);
}

module.exports = {
  renderHtmlTemplate,
};
