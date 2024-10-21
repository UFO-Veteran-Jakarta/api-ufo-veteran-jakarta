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
  divisionController.getDivisionById,
);

router.put(
  '/',
  authentication(),
  postDivisionValidationRules(),
  validate,
  divisionController.updateDivisionById,
);

router.delete('/', authentication(), divisionController.deleteDivisionById);

module.exports = router;
