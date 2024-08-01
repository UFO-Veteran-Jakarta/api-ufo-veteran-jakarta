const { check, validationResult } = require('express-validator');

const postPartnerValidationRules = () => {
  return [
    check('name')
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage('partner name is required')
      .isLength({ max: 255 })
      .withMessage('Partner name must be no more than 255 characters'),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).json({ status: 500, errors: errors.array() });
  }
  next();
};

module.exports = {
  postPartnerValidationRules,
  validate,
};
