const express = require("express");
const partnerController = require("../controllers/partnerController");

const {
  postPartnerValidationRules,
  validate,
} = require("../validators/partnerValidator");
const { authentication } = require("../middlewares/authMiddleware");
const { checkFile } = require("../middlewares/partnerMiddlewareFile");

const router = express.Router();

router.post(
  "/",
  authentication(),
  checkFile("logo"),
  postPartnerValidationRules(),
  validate,
  partnerController.uploadPartner
);

module.exports = router;
