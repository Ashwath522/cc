const logger = require('../common/logger');
const { appRedis } = require('../common/redis.init');
const { PRODUCT_TAG_REDIS_KEY } = require('../constants/redis.constant');

const getProductDetailsFromRedis = async (sku) => {
  try {
    const key = `${PRODUCT_TAG_REDIS_KEY}${sku}`;
    const result = await appRedis.get(key);
    if (result) {
      return JSON.parse(result);
    }
  } catch (error) {
    logger.error(`Error getProductDetailsFromRedis ${error.message}`);
  }

  return null;
};



module.exports = {
  getProductDetailsFromRedis
};
