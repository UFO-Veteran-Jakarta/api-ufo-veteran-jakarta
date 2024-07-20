const express = require("express");
const authController = require("src/controllers/authController");

const {
  registerValidationRules,
  validate,
  loginValidationRules,
} = require("../validators/authValidator");
const {
  checkMethod,
  authentication,
} = require("../middlewares/authMiddleware");

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

router.use(
  "/logout",
  checkMethod(["DELETE"]),
  authentication(),

  authController.logout
);

router.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Unauthorized");
  } else {
    next(err);
  }
});

module.exports = router;
