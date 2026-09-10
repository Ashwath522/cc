const logger = require('../common/logger');
const {
  EXTERNAL_API_AUTH_TOKEN,
} = require('../constants/externalAPI.constant');

const validateExternalAPIUser = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];

    if (!token || token != EXTERNAL_API_AUTH_TOKEN) {
      return res.sendStatus(401);
    }

    logger.info(`External API authorized successfully.`);

    return next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

module.exports = { validateExternalAPIUser };
