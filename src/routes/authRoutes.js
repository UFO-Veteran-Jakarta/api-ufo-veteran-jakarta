const express = require("express");
const authController = require("../controllers/AuthController");
const {
  registerValidationRules,
  validate,
  loginValidationRules,
} = require("../validators/authValidator");
const { checkMethod } = require("../middlewares/authMiddleware");
const router = express.Router();

router.use(
  "/register",
  checkMethod(["POST"]),
  registerValidationRules(),
  validate,
  authController.register
);

router.use(
  "/login",
  checkMethod(["POST"]),
  loginValidationRules(),
  validate,
  authController.login
);

module.exports = router;
