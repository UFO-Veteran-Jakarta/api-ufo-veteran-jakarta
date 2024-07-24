const express = require("express");
const contentController = require("../controllers/contentController");
const authController = require("../controllers/authController");

const {
  postValidationRules,
  validate,
} = require("../validators/contentValidator");
const { authentication } = require("../middlewares/authMiddleware");
const multer = require("../config/multer");

const router = express.Router();

// router.get("/", contentController.addContent);

router.post("/", authentication(), multer.single("file"), (req, res) => {
  return res.json({ msg: "ANJg" });
});

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
