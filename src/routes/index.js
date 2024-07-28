const express = require("express");
const authRoutes = require("./authRoutes");
const contentRoutes = require("./contentRoutes");
const eventRoutes = require("./eventRoutes");
const partnerRoutes = require("./partnerRoutes");
const achievementRoutes = require("./achievementRoutes");

const router = express.Router();

router.use("/", authRoutes);
router.use("/contents", contentRoutes);
router.use("/events", eventRoutes);
router.use("/partners", partnerRoutes);
router.use("/achievements", achievementRoutes);

module.exports = router;
