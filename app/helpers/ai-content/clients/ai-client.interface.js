'use strict';

/**
 * Base abstract interface contract for all LLM client adapters.
 */
class AiClientInterface {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Generates structured content (JSON by default or structured response).
   * @param {Object} params
   * @param {string} params.systemPrompt
   * @param {string} params.userPrompt
   * @param {Object} [params.options]
   * @returns {Promise<Object|string>}
   */
  async generateContent({ systemPrompt, userPrompt, options }) {
    throw new Error('generateContent must be implemented by adapter subclass');
  }

  /**
   * Generates plain text (e.g. for feedback rule compression).
   * @param {Object} params
   * @param {string} params.prompt
   * @param {Object} [params.options]
   * @returns {Promise<string>}
   */
  async generateText({ prompt, options }) {
    throw new Error('generateText must be implemented by adapter subclass');
  }
}

module.exports = AiClientInterface;
