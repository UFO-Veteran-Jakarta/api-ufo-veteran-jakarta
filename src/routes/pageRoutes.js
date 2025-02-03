const express = require('express');
const router = express.Router();

const pageController = require('../controllers/pageController');
const {
  updateValidationRules,
  validate,
} = require('../validators/pageValidator');
const { authentication } = require('../middlewares/authMiddleware');

router.get('/:slug/sections', pageController.getPageSectionBySlug);
router.get('/:slug', pageController.getPageBySlug);

router.patch(
  '/:slug/sections',
  authentication(),
  updateValidationRules(),
  validate,
  pageController.updatePageSectionBySlug,
);

module.exports = router;
