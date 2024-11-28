const express = require('express');
// const {
//   postDivisionValidationRules,
//   updateDivisionValidationRules,
//   validate,
// } = require('../validators/divisionValidator');
const { authentication } = require('../middlewares/authMiddleware');
const categoryGalleryController = require('../controllers/categoryGalleryController');

const router = express.Router();

// Public routes
router.get(
  '/',
  categoryGalleryController.getAllCategoryGalleries,
);

// Protected routes
router.post(
  '/',
  authentication(),
  // postDivisionValidationRules(),
  // validate,
  categoryGalleryController.addCategoryGallery,
);
router.patch(
  '/:id',
  authentication(),
  // updateDivisionValidationRules(),
  // validate,
  categoryGalleryController.updateCategoryGalleryById,
);
router.delete('/:id', authentication(), categoryGalleryController.deleteCategoryGalleryById);

module.exports = router;
