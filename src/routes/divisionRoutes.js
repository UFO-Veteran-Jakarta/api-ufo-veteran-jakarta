const express = require('express');
const {
  postDivisionValidationRules,
  updateDivisionValidationRules,
  validate,
} = require('../validators/divisionValidator');
const { authentication } = require('../middlewares/authMiddleware');
const { checkFileDivision, checkUpdatedFileDivision } = require('../middlewares/divisionMiddlewareFile');
const divisionController = require('../controllers/divisionController');

const router = express.Router();

router.post(
  '/',
  authentication(),
  checkFileDivision('image'),
  postDivisionValidationRules(),
  validate,
  divisionController.addDivision,
);

router.get(
  '/',
  divisionController.getAllDivisions,
);
router.get('/:slug', divisionController.getDivisionBySlug);

router.patch(
  '/:slug',
  authentication(),
  checkUpdatedFileDivision('image'),
  updateDivisionValidationRules(),
  validate,
  divisionController.updateDivisionBySlug,
);

router.delete('/:slug', authentication(), divisionController.deleteDivisionBySlug);

module.exports = router;
