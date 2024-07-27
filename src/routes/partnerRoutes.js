const express = require("express");
const partnerController = require("../controllers/partnerController");

const {
  postValidationRules,
  validate,
} = require("../validators/partnerValidator");
const { authentication } = require("../middlewares/authMiddleware");
const { checkFile } = require("../middlewares/partnerMiddlewareFile");

const router = express.Router();

router.post(
  "/",
  authentication(),
  checkFile("logo"),
  postValidationRules(),
  validate,
  partnerController.uploadPartner
);
