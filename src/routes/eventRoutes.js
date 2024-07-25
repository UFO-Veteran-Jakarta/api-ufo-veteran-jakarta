const express = require("express");
const contentController = require("../controllers/contentController");
const eventController = require("../controllers/eventController");

const {
  postValidationRules,
  validate,
} = require("../validators/eventValidator");
const { authentication } = require("../middlewares/authMiddleware");
const { checkFile } = require("../middlewares/contentMiddlewareFile");

const router = express.Router();

// router.get("/", contentController.addContent);

router.post(
  "/",
  authentication(),
  checkFile("cover"),
  checkFile("cover_landscape"),
  postValidationRules(),
  validate,
  eventController.uploadEvent
);

router.get("/", contentController.getAll);

router.put(
  "/",
  authentication(),
  postValidationRules(),
  validate,
  contentController.updateContent
);
router.delete("/", authentication(), contentController.deleteContent);

router.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("Unauthorized");
  } else {
    next(err);
  }
});

module.exports = router;
