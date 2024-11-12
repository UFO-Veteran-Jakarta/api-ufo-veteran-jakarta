const express = require('express');
const { authentication } = require('../middlewares/authMiddleware');
const { checkDivisionImage } = require('../middlewares/divisionMiddleware');
const {
  postDivisionValidationRules,
  updateDivisionValidationRules,
  validate,
  checkRequiredDivisionFields,
} = require('../validators/divisionValidator');
const divisionController = require('../controllers/divisionController');

const router = express.Router();

// Public routes
router.get('/', divisionController.getAllDivisions);
router.get('/:slug', divisionController.getDivisionBySlug);

// Protected routes
router.post(
  '/',
  authentication(),
  checkDivisionImage('image'),
  postDivisionValidationRules(),
  validate,
  divisionController.addDivision,
);

router.patch(
  '/:slug',
  authentication(),
  checkDivisionImage('image', false),
  updateDivisionValidationRules(),
  validate,
  checkRequiredDivisionFields,
  divisionController.updateDivisionBySlug,
);

router.delete(
  '/:slug',
  authentication(),
  divisionController.deleteDivisionBySlug,
);

module.exports = router;
