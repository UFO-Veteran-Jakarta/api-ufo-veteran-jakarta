const { check, validationResult, matchedData } = require('express-validator');

const postMemberValidationRules = () => {
  return [
    check('division_id')
      .isInt({ min: 1 })
      .withMessage('Division ID is required and must be a positive integer.'),
    check('position_id')
      .isInt({ min: 1 })
      .withMessage('Position ID is required and must be a positive integer.'),
    check('name')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Name is required. No data provided.')
      .isLength({ max: 255 })
      .withMessage('Name must be no more than 255 characters.'),
    check('image')
      .optional()
      .isString()
      .withMessage('Image must be a string (file path)'),
    check('angkatan')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Angkatan must be no more than 255 characters.'),
    check('instagram')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Instagram must be no more than 255 characters.'),
    check('linkedin')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('LinkedIn must be no more than 255 characters.'),
    check('whatsapp')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('WhatsApp must be no more than 255 characters.'),
  ];
};

const updateMemberValidationRules = () => {
  return [
    check('division_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Division ID must be a positive integer.'),
    check('position_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Position ID must be a positive integer.'),
    check('name')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Name must be no more than 255 characters.'),
    check('image')
      .optional()
      .isString()
      .withMessage('Image must be a string (file path)'),
    check('angkatan')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Angkatan must be no more than 255 characters.'),
    check('instagram')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('Instagram must be no more than 255 characters.'),
    check('linkedin')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('LinkedIn must be no more than 255 characters.'),
    check('whatsapp')
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage('WhatsApp must be no more than 255 characters.'),
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
  postMemberValidationRules,
  updateMemberValidationRules,
  validate,
};
