const express = require('express');
const authRoutes = require('./authRoutes');
const contentRoutes = require('./contentRoutes');
const eventRoutes = require('./eventRoutes');
const partnerRoutes = require('./partnerRoutes');
const achievementRoutes = require('./achievementRoutes');
const workProgramRoutes = require('./workProgramRoutes');
const latestActivityRoutes = require('./latestActivityRoutes');

const router = express.Router();

router.use('/', authRoutes);
router.use('/contents', contentRoutes);
router.use('/events', eventRoutes);
router.use('/partners', partnerRoutes);
router.use('/achievements', achievementRoutes);
router.use('/work-programs', workProgramRoutes);
router.use('/latest-activities', latestActivityRoutes);

module.exports = router;
