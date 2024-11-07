const express = require('express');
const {
  postDivisionValidationRules,
  updateDivisionValidationRules,
  validate,
} = require('../validators/divisionValidator');
const { authentication } = require('../middlewares/authMiddleware');
const { checkFileDivision } = require('../middlewares/divisionMiddlewareFile');
const divisionController = require('../controllers/divisionController');

const router = express.Router();

// Public routes
router.get(
  '/',
  divisionController.getAllDivisions,
);
router.get('/:slug', divisionController.getDivisionBySlug);

// Protected routes
router.post(
  '/',
  authentication(),
  postDivisionValidationRules(),
  validate,
  checkFileDivision('image'),
  divisionController.addDivision,
);
router.patch(
  '/:slug',
  authentication(),
  checkFileDivision('image', false, 'update'),
  updateDivisionValidationRules(),
  validate,
  divisionController.updateDivisionBySlug,
);
router.delete('/:slug', authentication(), divisionController.deleteDivisionBySlug);

module.exports = router;
