const express = require("express");
const authRoutes = require("./authRoutes");
const contentRoutes = require("./contentRoutes");

const router = express.Router();

router.use("/", authRoutes);
router.use("/contents", contentRoutes);

module.exports = router;
