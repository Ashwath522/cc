'use strict';

const GeminiAdapter = require('./gemini.adapter');
const OpenAiCompatibleAdapter = require('./openai-compatible.adapter');
const config = require('../../../common/config');

const PROVIDER_REGISTRY = {
  gemini: {
    name: 'gemini',
    shape_family: 'gemini',
    default_base_url: 'https://generativelanguage.googleapis.com/v1beta',
    default_model: 'gemini-1.5-flash',
    AdapterClass: GeminiAdapter,
  },
  openai: {
    name: 'openai',
    shape_family: 'openai_compatible',
    default_base_url: 'https://api.openai.com/v1',
    default_model: 'gpt-4o-mini',
    AdapterClass: OpenAiCompatibleAdapter,
  },
  groq: {
    name: 'groq',
    shape_family: 'openai_compatible',
    default_base_url: 'https://api.groq.com/openai/v1',
    default_model: 'llama-3.3-70b-versatile',
    AdapterClass: OpenAiCompatibleAdapter,
  },
  mistral: {
    name: 'mistral',
    shape_family: 'openai_compatible',
    default_base_url: 'https://api.mistral.ai/v1',
    default_model: 'mistral-large-latest',
    AdapterClass: OpenAiCompatibleAdapter,
  },
};

/**
 * Creates and returns the configured AI client adapter.
 */
function getAiClient(customConfig = {}) {
  const llmConfig = config.llm || {};
  const providerName = (customConfig.provider || llmConfig.provider || 'gemini').toLowerCase();

  const providerEntry = PROVIDER_REGISTRY[providerName];
  if (!providerEntry) {
    throw new Error(`Unsupported LLM provider "${providerName}". Available providers: ${Object.keys(PROVIDER_REGISTRY).join(', ')}`);
  }

  const clientConfig = {
    api_key: customConfig.api_key || llmConfig.api_key || process.env.LLM_API_KEY,
    base_url: customConfig.base_url || llmConfig.base_url || process.env.LLM_BASE_URL || providerEntry.default_base_url,
    model: customConfig.model || llmConfig.model || process.env.LLM_MODEL || providerEntry.default_model,
    ...customConfig,
  };

  return new providerEntry.AdapterClass(clientConfig);
}

module.exports = {
  PROVIDER_REGISTRY,
  getAiClient,
};
