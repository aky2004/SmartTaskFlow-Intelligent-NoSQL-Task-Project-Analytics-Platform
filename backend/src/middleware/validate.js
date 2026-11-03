const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = validations => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
    return next(new AppError(`Validation error - ${errorMessages}`, 400));
  };
};

module.exports = validate;

