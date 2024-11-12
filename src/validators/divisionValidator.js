const { validationResult, matchedData } = require('express-validator');
const {
  stringValidator,
  filePathValidator,
  atLeastOneFieldRequired,
} = require('./commonValidator');

/**
 * Validation rules for creating a new division.
 *
 * @returns {Object[]} Array of Express-validator middleware
 */
exports.postDivisionValidationRules = () => {
  return [
    stringValidator({
      field: 'name',
      maxLength: 255,
      customMessage: 'Division name is required. No data provided.',
    }),
    filePathValidator({ field: 'image' }),
  ];
};

/**
 * Validation rules for updating a division.
 *
 * @returns {Object[]} Array of Express-validator middleware
 */
exports.postDivisionValidationRules = () => {
  return [
    stringValidator({
      field: 'name',
      maxLength: 255,
      customMessage:
        'Division name is required and must be no more than 255 characters.',
    }),
    filePathValidator({ field: 'image', required: false }),
  ];
};

/**
 * Middleware to check if required fields are present for division operations.
 *
 * @type {Function}
 */
exports.checkRequiredDivisionFields = atLeastOneFieldRequired([
  'name',
  'image',
]);

/**
 * Middleware to validate and sanitize request data.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, errors: errors.array() });
  }

  req.body = matchedData(req, { onlyValidData: true });
  next();
};
