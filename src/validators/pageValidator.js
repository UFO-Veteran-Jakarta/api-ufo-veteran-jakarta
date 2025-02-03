const { check, validationResult, matchedData } = require('express-validator');

const updateValidationRules = () => {
  return [
    check('sections')
      .isArray()
      .withMessage('Sections must be an array.')
      .notEmpty()
      .withMessage('Sections are required.')
      .custom(value => {
        if (value.length === 0) {
          throw new Error('Sections array cannot be empty.');
        }
        return true;
      }),
    check('sections.*.section_key')
      .isString()
      .withMessage('Section Key must be a string.')
      .notEmpty()
      .withMessage('Section Key is required.'),
    check('sections.*.content')
      .isString()
      .withMessage('Section Key must be a string.')
      .notEmpty()
      .withMessage('Content is required.'),
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
  updateValidationRules,
  validate,
};
