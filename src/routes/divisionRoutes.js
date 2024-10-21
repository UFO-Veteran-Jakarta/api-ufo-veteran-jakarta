const express = require('express');
const {
  postDivisionValidationRules,
  validate,
} = require('../validators/divisionValidator');
const { authentication } = require('../middlewares/authMiddleware');
const checkFileDivision = require('../middlewares/divisionMiddlewareFile'); 
const divisionController = require('../controllers/divisionController');

const router = express.Router();

router.post(
  '/',
  authentication(),
  postDivisionValidationRules(),
  validate,
  checkFileDivision,
  divisionController.addDivision,
);

router.get(
  '/',
  divisionController.getAllDivisions,
);
router.get('/:slug', divisionController.getDivisionBySlug);

router.put(
  '/',
  authentication(),
  postDivisionValidationRules(),
  validate,
  divisionController.updateDivisionBySlug,
);

router.delete('/', authentication(), divisionController.deleteDivisionBySlug);

module.exports = router;
