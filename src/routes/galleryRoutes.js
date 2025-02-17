const express = require('express');
const fieldValidationRules = require('../utils/fieldValidator');
const fields = require('../validators/galleryValidator');
const { authentication } = require('../middlewares/authMiddleware');
const galleryController = require('../controllers/galleryController');

const router = express.Router();

// Public routes
router.get(
  '/',
  galleryController.getAllGalleries,
);
router.get('/:slug', galleryController.getGalleryBySlug);

// Protected routes
router.post(
  '/',
  authentication(),
  fieldValidationRules({ fields }),
  galleryController.addGallery,
);
router.patch(
  '/:slug',
  authentication(),
  fieldValidationRules({ fields, areRequired: false }),
  galleryController.updateGalleryBySlug,
);
router.delete('/:slug', authentication(), galleryController.deleteGalleryBySlug);

module.exports = router;
