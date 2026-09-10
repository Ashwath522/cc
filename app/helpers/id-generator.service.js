const nanoid = require('nanoid');
const idGenerator = (size) => {
  return nanoid(size);
};

module.exports = {
  idGenerator,
};
