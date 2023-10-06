const appError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode ? statusCode : 500;
  // eslint-disable-next-line no-self-assign
  error.stack = error.stack;
  return error;
};

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = "failed";
  }
}

module.exports = {appError, AppError};
