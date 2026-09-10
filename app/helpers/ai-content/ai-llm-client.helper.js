'use strict';

const { getAiClient } = require('./clients/client-factory');

let mockClientOverride = null;

function setMockClient(client) {
  mockClientOverride = client;
}

function clearMockClient() {
  mockClientOverride = null;
}

/**
 * Single chokepoint for structured content generation.
 */
async function generateContent({ systemPrompt, userPrompt, options }) {
  if (mockClientOverride) {
    return mockClientOverride.generateContent({ systemPrompt, userPrompt, options });
  }

  if (process.env.MODE === 'test') {
    // If running in test mode without mock client, attempt to load test mock if available
    try {
      const { mockGenerateContent } = require('../../../test/mockLlmClient');
      return mockGenerateContent({ systemPrompt, userPrompt });
    } catch (e) {
      // Fall through to real client if test mock not present
    }
  }

  const client = getAiClient(options?.clientConfig);
  return client.generateContent({ systemPrompt, userPrompt, options });
}

/**
 * Single chokepoint for plain text generation (e.g. feedback compression).
 */
async function generateText({ prompt, options }) {
  if (mockClientOverride) {
    return mockClientOverride.generateText({ prompt, options });
  }

  if (process.env.MODE === 'test') {
    try {
      const { mockGenerateText } = require('../../../test/mockLlmClient');
      return mockGenerateText({ prompt });
    } catch (e) {
      // Fall through to real client
    }
  }

  const client = getAiClient(options?.clientConfig);
  return client.generateText({ prompt, options });
}

module.exports = {
  generateContent,
  generateText,
  setMockClient,
  clearMockClient,
};
