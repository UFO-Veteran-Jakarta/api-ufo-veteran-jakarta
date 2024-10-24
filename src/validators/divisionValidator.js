const { check, validationResult, matchedData } = require('express-validator');

const postDivisionValidationRules = () => {
  return [
    check('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Division name is required. No data provided.')
      .isLength({ max: 255 })
      .withMessage('Division name must be no more than 255 characters.'),
    check('image')
      .optional()
      .isString()
      .withMessage('Image must be a string (file path)')
      .notEmpty()
      .withMessage('Image is required. No data provided.'),
  ];
};

const checkRequiredFields = (req, res, next) => {
  const { name, image } = req.body;

  if (!name && !image) {
    return res.status(400).json({
      status: 400,
      message: 'Division name and image are required',
    });
  }

  next();
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
  checkRequiredFields,
};
