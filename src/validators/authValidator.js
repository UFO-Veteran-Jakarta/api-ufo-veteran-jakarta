const { check, validationResult } = require("express-validator");

const registerValidationRules = () => {
  return [
    check("username")
      .isString()
      .trim()
      .not()
      .isEmpty()
      .escape()
      .withMessage("Username is required")
      .matches(/^[a-zA-Z0-9]+$/)
      .withMessage("Username should not contain special characters")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters"),
    check("password")
      .isString()
      .isLength({ min: 8, max: 64 })
      .escape()
      .withMessage("Password must be between 8 and 64 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W]).*$/)
      .withMessage(
        "Password must consist of at least one lowercase, one uppercase, one special character, and one number"
      ),
    //   .matches(/[a-z]/)
    //   .withMessage("Password must contain at least one lowercase letter")
    //   .matches(/[A-Z]/)
    //   .withMessage("Password must contain at least one uppercase letter")
    //   .matches(/[0-9]/)
    //   .withMessage("Password must contain at least one number")
    //   .matches(/[\W]/)
    //   .withMessage("Password must contain at least one special character"),
  ];
};

const loginValidationRules = () => {
  return [
    check("username")
      .isString()
      .withMessage("The username and password must be strings")
      .not()
      .isEmpty()
      .escape()
      .withMessage("Username is required"),
    check("password")
      .isString()
      .withMessage("The username and password must be strings")
      .not()
      .isEmpty()
      .escape()
      .withMessage("Password is required"),
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
  registerValidationRules,
  loginValidationRules,
  validate,
};
