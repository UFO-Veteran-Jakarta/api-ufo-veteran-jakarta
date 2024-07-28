const { check, validationResult } = require("express-validator");

const postValidationRules = () => {
  return [
    check("link")
      .isString()
      .trim()
      .not()
      .isEmpty()
      .withMessage("link is required")
      .matches(/^https:\/\/.*/)
      .withMessage(
        "The link must be a string and a link evidenced by https:// at the beginning"
      )
      .matches(
        /^https:\/\/(www\.)?[a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_~#?&/=]*)$/
      )
      .withMessage("The link must valid a url"),
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
  postValidationRules,
  validate,
};
