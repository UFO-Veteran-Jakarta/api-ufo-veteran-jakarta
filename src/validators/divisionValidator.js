const { check, validationResult, matchedData } = require('express-validator');

function createStringFieldValidator(fieldName, errorMessage, maxLength = null) {
  let validator = check(fieldName)
    .isString()
    .trim()
    .not()
    .isEmpty()
    .withMessage(`${fieldName} is required`);

  if (maxLength) {
    validator = validator
      .isLength({ max: maxLength })
      .withMessage(
        `${errorMessage} must be no more than ${maxLength} characters`,
      );
  }

  return validator;
}

const postDivisionValidationRules = () => {
  return [
    createStringFieldValidator('name', 'Division name', 255),
    check('image')
      .optional()
      .isString()
      .withMessage('Image must be a string (file path)'),
  ];
};

const updateDivisionValidationRules = () => {
  return [
    check('name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Division name must be no more than 255 characters'),
    check('image')
      .optional()
      .isString()
      .withMessage('Image must be a string (file path)'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 400, errors: errors.array() });
  }

  req.body = matchedData(req, { onlyValidData: true });
  next();
};

module.exports = {
  postDivisionValidationRules,
  updateDivisionValidationRules,
  validate,
};
