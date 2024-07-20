const express = require("express");
const authRoutes = require("./AuthRoutes");
const { authentication } = require("../middlewares/authMiddleware");

const router = express.Router();

router.use("/", authRoutes);
// router.use("/users", authentication());

module.exports = router;
