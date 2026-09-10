'use strict';

const { appRedis } = require('../common/redis.init');
const logger = require('../common/logger');

const CACHE_KEY_PREFIX = 'cms:definition:';
const CACHE_TTL_SECONDS = 3600;

const getDefinitionCacheKey = (companyId, applicationId, slug) =>
  `${CACHE_KEY_PREFIX}${companyId}:${applicationId}:${slug}`;

const getDefinitionFromCache = async (companyId, applicationId, slug) => {
  const key = getDefinitionCacheKey(companyId, applicationId, slug);
  try {
    const result = await appRedis.get(key);
    if (!result) {
      return null;
    }
    return JSON.parse(result);
  } catch (error) {
    logger.error(`schema-cache get error ${error.message}`);
    return null;
  }
};

const setDefinitionCache = async (companyId, applicationId, slug, definition) => {
  const key = getDefinitionCacheKey(companyId, applicationId, slug);
  try {
    await appRedis.set(key, JSON.stringify(definition), 'EX', CACHE_TTL_SECONDS);
  } catch (error) {
    logger.error(`schema-cache set error ${error.message}`);
  }
};

const invalidateDefinitionCache = async (companyId, applicationId, slug) => {
  const key = getDefinitionCacheKey(companyId, applicationId, slug);
  try {
    await appRedis.del(key);
  } catch (error) {
    logger.error(`schema-cache invalidate error ${error.message}`);
  }
};

module.exports = {
  getDefinitionCacheKey,
  getDefinitionFromCache,
  setDefinitionCache,
  invalidateDefinitionCache,
};
