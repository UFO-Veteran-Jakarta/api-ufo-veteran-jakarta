const express = require("express");
const workProgramController = require("../controllers/workProgramController");

const {
  postWorkProramValidationRules,
  validate,
} = require("../validators/workProgramValidator");
const { authentication } = require("../middlewares/authMiddleware");
const {
  checkFile,
  checkFileForUpdate,
} = require("../middlewares/workProgramMiddlewareFile");

const router = express.Router();

router.post(
  "/",
  authentication(),
  checkFile("image"),
  postWorkProramValidationRules(),
  validate,
  workProgramController.addWorkProgram
);

router.get("/", workProgramController.getAllWorkPrograms);

module.exports = router;
