'use strict';

const AiClientInterface = require('./ai-client.interface');
const logger = require('../../../common/logger');

class OpenAiCompatibleAdapter extends AiClientInterface {
  constructor(config = {}) {
    super(config);
    this.apiKey = config.api_key || process.env.LLM_API_KEY || '';
    this.baseUrl = (config.base_url || process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    this.model = config.model || process.env.LLM_MODEL || 'gpt-4o-mini';
  }

  async _callOpenAi({ systemPrompt, userPrompt, jsonMode = true }) {
    if (!this.apiKey) {
      throw new Error('LLM_API_KEY is not set. Please provide a valid API key for the OpenAI-compatible provider.');
    }

    const url = `${this.baseUrl}/chat/completions`;

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: userPrompt });

    const body = {
      model: this.model,
      messages,
      temperature: 0.85,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };

    let response;
    let retries = 0;
    while (retries < 5) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 429) {
        retries++;
        const waitTime = 3000 * retries;
        logger.warn(`[OpenAiCompatibleAdapter] Rate limit 429. Retrying in ${waitTime / 1000}s (attempt ${retries}/5)...`);
        await new Promise((r) => setTimeout(r, waitTime));
        continue;
      }
      break;
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(`OpenAI-compatible API returned no content: ${JSON.stringify(data)}`);
    }

    if (!jsonMode) {
      return content.trim();
    }

    const cleaned = content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  }

  async generateContent({ systemPrompt, userPrompt }) {
    return this._callOpenAi({ systemPrompt, userPrompt, jsonMode: true });
  }

  async generateText({ prompt }) {
    return this._callOpenAi({ systemPrompt: '', userPrompt: prompt, jsonMode: false });
  }
}

module.exports = OpenAiCompatibleAdapter;
