const { check } = require('express-validator');

/**
 * Generate a validation rule for a string field.
 *
 * @param {Object} options - Validation options
 * @param {string} options.field - The field name to validate
 * @param {boolean} [options.required=true] - Whether the field is required
 * @param {number} [options.maxLength] - Maximum length of the string
 * @param {string} [options.customMessage] - Custom error message
 * @returns {Object} Express-validator chain object
 */
exports.stringValidator = ({
  field,
  required = true,
  maxLength,
  customMessage,
}) => {
  let chain = check(field);

  if (required) {
    chain = chain
      .notEmpty()
      .withMessage(customMessage || `${field} is required`);
  } else {
    chain = chain.optional();
  }

  chain = chain.isString().withMessage(`${field} must be a string`);

  if (maxLength) {
    chain = chain
      .isLength({ max: maxLength })
      .withMessage(`${field} must be no more than ${maxLength} characters`);
  }

  return chain;
};

/**
 * Generate a validation rule for a file path field.
 *
 * @param {Object} options - Validation options
 * @param {string} options.field - The field name to validate
 * @param {boolean} [options.required=true] - Whether the field is required
 * @returns {Object} Express-validator chain object
 */
exports.filePathValidator = ({ field, required = true }) => {
  let chain = check(field);

  if (required) {
    chain = chain.notEmpty().withMessage(`${field} is required`);
  } else {
    chain = chain.optional();
  }

  return chain.isString().withMessage(`${field} must be a string (file path)`);
};

/**
 * Middleware to check if at least one of the specified fields is present in the request.
 *
 * @param {string[]} fields - Array of field names to check
 * @returns {Function} Express middleware function
 */
exports.atLeastOneFieldRequired = (fields) => {
  return (req, res, next) => {
    const hasAtLeastOne = fields.some((field) => req.body[field] !== undefined);
    if (!hasAtLeastOne) {
      return res.status(400).json({
        status: 400,
        message: `At least one of ${fields.join(', ')} is required`,
      });
    }
    next();
  };
};
