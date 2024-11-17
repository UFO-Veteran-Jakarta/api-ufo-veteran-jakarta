const { check, validationResult, matchedData } = require('express-validator');

// Shared validation configurations
const sharedValidations = {
  divisionId: (isRequired = true) => {
    const validator = check('division_id')
      .isInt({ min: 1 })
      .withMessage('Division ID is required and must be a positive integer.');
    return isRequired ? validator : validator.optional();
  },

  positionId: (isRequired = true) => {
    const validator = check('position_id')
      .isInt({ min: 1 })
      .withMessage('Position ID is required and must be a positive integer.');
    return isRequired ? validator : validator.optional();
  },

  name: (isRequired = true) => {
    let validator = check('name')
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Name must be no more than 255 characters.');

    if (isRequired) {
      validator = validator
        .notEmpty()
        .withMessage('Name is required. No data provided.');
    } else {
      validator = validator.optional();
    }
    return validator;
  },

  optionalString: (field) => {
    return check(field)
      .optional()
      .isString()
      .isLength({ max: 255 })
      .withMessage(
        `${field.charAt(0).toUpperCase() + field.slice(1)} must be no more than 255 characters.`,
      );
  },

  optionalImage: () => {
    return check('image')
      .optional()
      .isString()
      .withMessage('Image must be a string (file path)');
  },
};

const postMemberValidationRules = () => {
  return [
    sharedValidations.divisionId(true),
    sharedValidations.positionId(true),
    sharedValidations.name(true),
    sharedValidations.optionalImage(),
    sharedValidations.optionalString('angkatan'),
    sharedValidations.optionalString('instagram'),
    sharedValidations.optionalString('linkedin'),
    sharedValidations.optionalString('whatsapp'),
  ];
};

const updateMemberValidationRules = () => {
  return [
    sharedValidations.divisionId(false),
    sharedValidations.positionId(false),
    sharedValidations.name(false),
    sharedValidations.optionalImage(),
    sharedValidations.optionalString('angkatan'),
    sharedValidations.optionalString('instagram'),
    sharedValidations.optionalString('linkedin'),
    sharedValidations.optionalString('whatsapp'),
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
