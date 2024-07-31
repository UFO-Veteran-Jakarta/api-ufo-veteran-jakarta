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

const postWorkProgramValidationRules = () => {
  return [
    createStringFieldValidator('title', 'Work program title', 255),
    createStringFieldValidator('description', 'Description of work program'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).json({ status: 500, errors: errors.array() });
  }
  req.body = matchedData(req, { onlyValidData: true });
  next();
};

module.exports = {
  postWorkProgramValidationRules,
  validate,
};
