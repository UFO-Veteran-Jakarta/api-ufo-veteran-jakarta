const { check, validationResult, matchedData } = require("express-validator");

const postWorkProramValidationRules = () => {
  return [
    check("title")
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage("Title is required")
      .isLength({ max: 255 })
      .withMessage("Event title must be no more than 255 characters"),
    check("description")
      .isString()
      .not()
      .isEmpty()
      .withMessage("description of work program is required"),
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
  postWorkProramValidationRules,
  validate,
};
