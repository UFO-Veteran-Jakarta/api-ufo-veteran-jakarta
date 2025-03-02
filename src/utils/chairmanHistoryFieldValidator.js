// src/utils/fieldValidator.js
const { check, validationResult, matchedData } = require('express-validator');
const { getActiveChairman } = require('../models/chairmanHistoryModel');

/**
 * Utility function to dynamically build field validation rules based on the fields array
 *
 * Usage:
 * fieldValidationRules({
 *   fields: [
 *     {
 *       name: 'field_name',
 *       type: 'integer|signed_integer|string|text|image|chairman_start_year
 *              |chairman_end_year|chairman_active',
 *       optional: true|false, // optional, default is false
 *     },
 *     ...
 *   ],
 *   areRequired: true|false, // optional, default is true
 * });
 *
 * @param {*} param0
 * @returns
 */
const fieldValidationRules = ({ fields, areRequired = true }) => {
  return [
    // Validation rules for fields
    ...fields.map((field) => {
      let validationChain = check(field.name);

      // Flag to know that a field is optional
      const isFieldOptional = field.optional || !areRequired;

      // Apply validation based on the type
      switch (field.type) {
        case 'string':
          validationChain = validationChain
            .isString()
            .trim()
            .notEmpty()
            .withMessage(`${field.name} is required. No data provided.`)
            .isLength({ max: 255 })
            .withMessage(`${field.name} must be no more than 255 characters.`)
            .matches(/^[A-Za-z\s]+$/)
            .withMessage(`${field.name} can only contain letters and spaces.`);
          break;
        case 'chairman_start_year':
          validationChain = validationChain
            .isInt()
            .withMessage(`${field.name} is required and must be an integer.`)
            .custom((value) => {
              const currentYear = new Date().getFullYear();
              if (parseInt(value, 10) > currentYear) {
                throw new Error(`Start year cannot be greater than current year (${currentYear}).`);
              }
              return true;
            });
          break;
        case 'chairman_active':
          validationChain = validationChain
            .isBoolean()
            .withMessage(`${field.name} is required and must be an boolean.`)
            .custom(async (value, { req }) => {
              // Convert string 'true'/'false' to boolean if needed
              const isActive = value === true || value === 'true';
              const activeChairman = await getActiveChairman();

              if (isActive && activeChairman) {
                throw new Error('Cannot set as active when another chairman is currently active.');
              }

              // Find the end_year field from the fields array
              const endYearField = fields.find((f) => f.type === 'chairman_end_year');
              const endYearName = endYearField ? endYearField.name : 'end_year';

              if (isActive && req.body[endYearName] !== undefined
                && req.body[endYearName] !== null
                && req.body[endYearName] !== ''
              ) {
                throw new Error('End year must be null if chairman is active.');
              }

              if (!isActive && (req.body[endYearName] === undefined
                || req.body[endYearName] === null
                || req.body[endYearName] === '')
              ) {
                throw new Error('End year is required if chairman is not active.');
              }

              return true;
            });
          break;
        case 'chairman_end_year':
          validationChain = validationChain
            .optional() // Allow empty value to be converted to null
            .custom((value, { req }) => {
              // Skip validation if value is empty or null
              if (value === '' || value === undefined || value === null) {
                return true;
              }

              // Check if it's an integer
              if (!/^\d+$/.test(value)) {
                throw new Error(`${field.name} must be an integer.`);
              }
              // Find the start_year field from the fields array
              const startYearField = fields.find((f) => f.type === 'chairman_start_year');
              const startYearName = startYearField ? startYearField.name : 'start_year';

              const startYear = req.body[startYearName];
              if (startYear && parseInt(value, 10) <= parseInt(startYear, 10)) {
                throw new Error('End year must be greater than start year.');
              }
              return true;
            });
          break;
        case 'image':
          validationChain = validationChain
            .custom((value, { req }) => {
              const imageNotSpecified = !req.files || !req.files[field.name];

              // Skip-optional and not specified image
              if (isFieldOptional && imageNotSpecified) {
                return true;
              }

              // Ensure the image exists in the request
              if (imageNotSpecified) {
                throw new Error(`${field.name} is required.`);
              }

              // Extract the uploaded file object from req.files
              const image = req.files[field.name];

              // Check if the file is an image and has .webp extension
              if (!image.name.match(/\.(webp|jpg|jpeg|png)$/i)) {
                throw new Error('Image must be in jpg, jpeg, png, or webp format.');
              }

              // Check file size
              if (image.size > 5 * 1024 * 1024) {
                throw new Error('Image must be smaller than 5MB.');
              }

              return true;
            });
          break;

        default:
          break;
      }

      // Handle optional fields
      if (isFieldOptional && field.type !== 'image') {
        validationChain = validationChain.optional();
      }

      return validationChain;
    }),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, errors: errors.array() });
      }
      req.body = matchedData(req, { onlyValidData: true });
      next();
    },
  ];
};

module.exports = fieldValidationRules;
