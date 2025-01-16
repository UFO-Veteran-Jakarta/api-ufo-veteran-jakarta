const express = require('express');
const authRoutes = require('./authRoutes');
const contentRoutes = require('./contentRoutes');
const eventRoutes = require('./eventRoutes');
const partnerRoutes = require('./partnerRoutes');
const achievementRoutes = require('./achievementRoutes');
const workProgramRoutes = require('./workProgramRoutes');
const latestActivityRoutes = require('./latestActivityRoutes');
const divisionRoutes = require('./divisionRoutes');
const positionRoutes = require('./positionRoutes');
const memberRoutes = require('./memberRoutes');
const categoriesRoutes = require('./categoriesRoutes');
const galleryRoutes = require('./galleryRoutes');
const categoryGalleryRoutes = require('./categoryGalleryRoutes');
const articleRoutes = require('./articleRoutes');

const router = express.Router();

router.use('/', authRoutes);
router.use('/contents', contentRoutes);
router.use('/events', eventRoutes);
router.use('/partners', partnerRoutes);
router.use('/achievements', achievementRoutes);
router.use('/work-programs', workProgramRoutes);
router.use('/latest-activities', latestActivityRoutes);
router.use('/divisions', divisionRoutes);
router.use('/positions', positionRoutes);
router.use('/members', memberRoutes);
router.use('/category-article', categoriesRoutes);
router.use('/galleries', galleryRoutes);
router.use('/category-gallery', categoryGalleryRoutes);
router.use('/articles', articleRoutes);

module.exports = router;
