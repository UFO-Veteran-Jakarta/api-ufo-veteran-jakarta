const { check, validationResult, matchedData } = require('express-validator');

const postGalleryValidationRules = () => {
  return [
    check('category_galleries_id')
      .isInt({ min: 1 })
      .withMessage('Category Galleries ID is required and must be a positive integer.'),
    check('title')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Gallery title is required. No data provided.')
      .isLength({ max: 255 })
      .withMessage('Gallery title must be no more than 255 characters.'),
    check('snippet')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 255 })
      .withMessage('Gallery title must be no more than 255 characters.'),
    check('author')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .isLength({ max: 255 })
      .withMessage('Gallery title must be no more than 255 characters.'),
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

const updateGalleryValidationRules = () => {
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
  postGalleryValidationRules,
  updateGalleryValidationRules,
  validate,
  checkRequiredFields,
};
