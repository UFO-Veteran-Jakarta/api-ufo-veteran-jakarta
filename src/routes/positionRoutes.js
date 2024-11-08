const express = require('express');
const {
  postValidationRules,
  updateValidationRules,
  validate,
} = require('../validators/positionValidator');
const positionController = require('../controllers/positionController');
const { authentication } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/',
  authentication(),
  postValidationRules(),
  validate,
  positionController.addPosition,
);

router.get(
  '/',
  positionController.getAllPositions,
);

router.get(
  '/:id',
  positionController.getPositionById,
);

router.patch(
  '/:id',
  authentication(),
  updateValidationRules(),
  validate,
  positionController.updatePositionById,
);

router.delete(
  '/:id',
  authentication(),
  positionController.deletePositionById,
);

module.exports = router;
