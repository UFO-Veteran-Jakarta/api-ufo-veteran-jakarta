const express = require('express');
const {
  postGalleryValidationRules,
  updateGalleryValidationRules,
  validate,
} = require('../validators/galleryValidator');
const { authentication } = require('../middlewares/authMiddleware');
const { checkFileGallery } = require('../middlewares/galleryMiddlewareFile');
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
  postGalleryValidationRules(),
  validate,
  checkFileGallery('image'),
  galleryController.addGallery,
);
router.patch(
  '/:slug',
  authentication(),
  checkFileGallery('image', false, 'update'),
  updateGalleryValidationRules(),
  validate,
  galleryController.updateGalleryBySlug,
);
router.delete('/:slug', authentication(), galleryController.deleteGalleryBySlug);

module.exports = router;
