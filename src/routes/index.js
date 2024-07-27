const express = require("express");
const authRoutes = require("./authRoutes");
const contentRoutes = require("./contentRoutes");
const eventRoutes = require("./eventRoutes");

const router = express.Router();

router.use("/", authRoutes);
router.use("/contents", contentRoutes);
router.use("/events", eventRoutes);

module.exports = router;
