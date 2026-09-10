class BaseException extends Error {
  name = 'BaseException';
  constructor(message, data) {
    super(message);
    this.data = data;
  }
}

module.exports = BaseException;
