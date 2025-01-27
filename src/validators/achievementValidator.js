const { check, validationResult } = require('express-validator');

const postAchievementValidationRules = () => {
  return [
    check('name')
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Achievement name is required')
      .isLength({ max: 255 })
      .withMessage('Achievement name must be no more than 255 characters'),

    check('year')
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage('Achievement year is required')
      .isLength({ max: 4 })
      .withMessage('Achievement year must be no more than 4 characters'),
  ];
};

const updateAchievementValidationRules = () => {
  return [
    check('name')
      .optional()
      .isString()
      .trim()
      .withMessage('Achievement name is required')
      .isLength({ max: 255 })
      .withMessage('Achievement name must be no more than 255 characters'),

    check('year')
      .optional()
      .isString()
      .trim()
      .withMessage('Achievement year is required')
      .isLength({ max: 4 })
      .withMessage('Achievement year must be no more than 4 characters'),
  ]
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).json({ status: 500, errors: errors.array() });
  }
  next();
};

module.exports = {
  postAchievementValidationRules,
  updateAchievementValidationRules,
  validate,
};
