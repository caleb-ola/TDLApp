const ErrorMessage = (message, statusCode, res) => {
  res.status(statusCode);
  throw new Error(message);
};

module.exports = ErrorMessage;
