const getDelayByIteration = (iteration) => {
  //5s, 1m, 15m, 30m
  let nextDelay;
  switch (iteration) {
    case 1:
      nextDelay = 5000;
      break;
    case 2:
      nextDelay = 60000;
      break;
    case 3:
      nextDelay = 900000;
      break;
    case 4:
      nextDelay = 1800000;
      break;
    default:
      nextDelay = null;
  }
  return nextDelay;
};

const buildExcelError = (errorObj, errorMeta) => {
  const msg =
    typeof errorObj.message === "function"
      ? errorObj.message(errorMeta)
      : errorObj.message;

  return `${errorObj.code}: ${msg}`;
};

module.exports = { getDelayByIteration: getDelayByIteration, buildExcelError };
