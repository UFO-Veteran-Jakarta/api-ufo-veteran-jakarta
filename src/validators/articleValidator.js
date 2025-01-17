const { check, validationResult, matchedData } = require('express-validator');

// Shared validation configurations
const sharedValidations = {

  categoryId: (isRequired = true) => {
    let validator = check('category_id');
    if (isRequired) {
      validator = validator
        .isInt({ min: 1 })
        .withMessage('Category article ID is required and must be a positive integer.');
    } else {
      validator = validator.optional();
    }
    return validator;
  },

  title: (isRequired = true) => {
    let validator = check('title')
      .isString()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Title must be no more than 255 characters.');

    if (isRequired) {
      validator = validator
        .notEmpty()
        .withMessage('Title is required. No data provided.');
    } else {
      validator = validator.optional();
    }
    return validator;
  },

  author: (isRequired = true) => {
    let validator = check('author')
      .isString()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Author must be no more than 100 characters.');

    if (isRequired) {
      validator = validator
        .notEmpty()
        .withMessage('Author is required. No data provided.');
    } else {
      validator = validator.optional();
    }
    return validator;
  },

  body: (isRequired = true) => {
    let validator = check('body')
      .isString()
      .withMessage('Body must be a string.');

    if (isRequired) {
      validator = validator
        .notEmpty()
        .withMessage('Body is required. No data provided.');
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
};

const postArticleValidationRules = () => {
  return [
    sharedValidations.categoryId(true),
    sharedValidations.title(true),
    sharedValidations.author(true),
    sharedValidations.optionalString('cover_landscape'),
    sharedValidations.optionalString('cover'),
    sharedValidations.optionalString('snippets'),
    sharedValidations.body(true),
  ];
};

const updateArticleValidationRules = () => {
  return [
    sharedValidations.categoryId(false),
    sharedValidations.title(false),
    sharedValidations.author(false),
    sharedValidations.optionalString('cover_landscape'),
    sharedValidations.optionalString('cover'),
    sharedValidations.optionalString('snippets'),
    sharedValidations.body(false),
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
  postArticleValidationRules,
  updateArticleValidationRules,
  validate,
};
