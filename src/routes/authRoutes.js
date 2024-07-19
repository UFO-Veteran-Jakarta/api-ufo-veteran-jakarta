const express = require("express");
const authController = require("../controllers/AuthController");
const {
  registerValidationRules,
  validate,
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

module.exports = router;
