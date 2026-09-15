'use strict';

const convict = require('convict');
const mongodbUri = require('mongodb-uri');

convict.addFormat({
  name: 'mongo-uri',
  validate: function (val) {
    let parsed = mongodbUri.parse(val);
    mongodbUri.format(parsed);
  },
  coerce: function (urlString) {
    if (urlString) {
      let parsed = mongodbUri.parse(urlString);
      urlString = mongodbUri.format(parsed);
    }
    return urlString;
  },
});

let config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  fynd_platform_domain: {
    doc: 'Fynd Platform Domain',
    format: String,
    default: 'swadeshz5.de',
    env: 'FYND_PLATFORM_DOMAIN',
    arg: 'fynd_platform_domain',
  },
  pod_name: {
    doc: 'pod name',
    format: String,
    default: 'groot',
    env: 'K8S_POD_NAME',
    arg: 'k8s_pod_name',
  },
  extension: {
    api_key: {
      doc: 'extension api key',
      default: '69df5ece363550cfa795d0c1',
      env: 'EXTENSION_API_KEY',
    },
    api_secret: {
      doc: 'extension api secret',
      default: '2lBaWoI4-Gp_TzP',
      env: 'EXTENSION_API_SECRET',
    },
    base_url: {
      doc: 'extension base_url',
      default: 'https://excavate-rind-pajamas.ngrok-free.dev',
      env: 'EXTENSION_BASE_URL',
    },
  },
  sentry: {
    dsn: {
      doc: 'sentry url',
      format: String,
      default: '',
      env: 'SENTRY_DSN',
      arg: 'sentry_dsn',
    },
    environment: {
      doc: 'sentry environment',
      format: String,
      default: 'development',
      env: 'SENTRY_ENVIRONMENT',
      arg: 'sentry_environment',
    },
  },
  mongo: {
    host: {
      uri: {
        doc: 'host mongo',
        format: 'mongo-uri',
        default: 'mongodb://localhost:27017/content-x',
        env: 'MONGO_CONTENTX_READ_WRITE',
        arg: 'mongo_contentx_read_write',
      },
    },
  },
  redis: {
    host: {
      doc: 'Redis URL of host.',
      format: String,
      default: 'redis://localhost:6379/0',
      env: 'REDIS_CONTENTXEXT_READ_WRITE',
      arg: 'redis_contentxext_read_write',
    },
  },
  mode: {
    doc: 'app mode',
    format: String,
    default: 'server',
    env: 'MODE',
    arg: 'mode',
  },
  port: {
    doc: 'The port to bind',
    format: 'port',
    default: 8082,
    env: 'PORT',
    arg: 'port',
  },
  BROWSER_CONFIG: {
    HOST_MAIN_URL: {
      doc: 'Host Main URL',
      format: String,
      default: 'https://excavate-rind-pajamas.ngrok-free.dev',
      env: 'EXTENSION_BASE_URL',
    },
  },
  APP_IDENTIFIER: {
    doc: 'app_identifier',
    format: String,
    default: 'content-x',
    env: 'APP_IDENTIFIER',
    arg: 'app_identifier',
  },
  newrelic: {
    app_name: {
      doc: 'new relic app name',
      format: String,
      default: 'content-x',
      env: 'NEW_RELIC_APP_NAME',
      arg: 'new_relic_app_name',
    },
    license_key: {
      doc: 'new relic license key',
      format: String,
      default: '',
      env: 'NEW_RELIC_LICENSE_KEY',
      args: 'new_relic_license_key',
    },
  },
  SALES_CHANNEL: {
    company_id: '95',
    application_id: '65eb1972926345654bc9c1a8',
  },
  llm: {
    provider: {
      doc: 'LLM provider name (e.g. gemini, openai, groq)',
      format: String,
      default: 'gemini',
      env: 'LLM_PROVIDER',
      arg: 'llm_provider',
    },
    api_key: {
      doc: 'LLM API key',
      format: String,
      default: '',
      env: 'LLM_API_KEY',
      arg: 'llm_api_key',
    },
    model: {
      doc: 'LLM model name',
      format: String,
      default: 'gemini-1.5-flash',
      env: 'LLM_MODEL',
      arg: 'llm_model',
    },
    base_url: {
      doc: 'LLM Base URL override',
      format: String,
      default: '',
      env: 'LLM_BASE_URL',
      arg: 'llm_base_url',
    },
  },
});


// Perform validation
config.validate({
  allowed: 'strict',
});
config = config.get();

module.exports = config;
