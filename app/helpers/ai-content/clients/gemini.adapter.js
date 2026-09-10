'use strict';

const AiClientInterface = require('./ai-client.interface');
const { LLM_RESPONSE_SCHEMA } = require('../ai-schema.helper');
const logger = require('../../../common/logger');

class GeminiAdapter extends AiClientInterface {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.api_key || process.env.LLM_API_KEY || '';
    this.baseUrl = config.base_url || process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    this.model = config.model || process.env.LLM_MODEL || 'gemini-1.5-flash';
  }

  async _callGemini({ systemPrompt, userPrompt, jsonMode = true }) {
    if (!this.apiKey) {
      throw new Error(
        'LLM_API_KEY is not set. Please provide a valid Gemini API key in configuration.',
      );
    }

    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ];

    const body = {
      contents,
      generationConfig: {
        temperature: 0.85,
        ...(jsonMode
          ? {
              responseMimeType: 'application/json',
              responseSchema: LLM_RESPONSE_SCHEMA,
            }
          : {}),
      },
    };

    if (systemPrompt) {
      body.systemInstruction = { parts: [{ text: systemPrompt }] };
    }

    let response;
    let retries = 0;
    while (retries < 5) {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        retries++;
        const waitTime = 3000 * retries;
        logger.warn(`[GeminiAdapter] Rate limit 429 encountered. Retrying in ${waitTime / 1000}s (attempt ${retries}/5)...`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }
      break;
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error(`Gemini API returned no content. Full response: ${JSON.stringify(data)}`);
    }

    if (!jsonMode) {
      return text.trim();
    }

    const cleaned = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }

  async generateContent({ systemPrompt, userPrompt }) {
    return this._callGemini({ systemPrompt, userPrompt, jsonMode: true });
  }

  async generateText({ prompt }) {
    return this._callGemini({ systemPrompt: '', userPrompt: prompt, jsonMode: false });
  }
}

module.exports = GeminiAdapter;
