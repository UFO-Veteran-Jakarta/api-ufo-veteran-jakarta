const express = require('express');
const fieldValidationRules = require('../utils/chairmanHistoryFieldValidator');
const fields = require('../validators/chairmanValidator');
const { authentication } = require('../middlewares/authMiddleware');
const chairmanHistoryController = require('../controllers/chairmanHistoryController');

const router = express.Router();

// public routes
router.get(
  '/',
  chairmanHistoryController.getAllChairmanHistories,
);

router.get(
  '/:id',
  chairmanHistoryController.getChairmanHistoryById,
);

// private routes
router.post(
  '/',
  authentication(),
  fieldValidationRules({ fields }),
  chairmanHistoryController.addChairmanHistory,
);

router.put( // Backwards compatibility
  '/:id',
  authentication(),
  fieldValidationRules({ fields, areRequired: false }),
  chairmanHistoryController.updateChairmanHistoryById,
);
router.patch(
  '/:id',
  authentication(),
  fieldValidationRules({ fields, areRequired: false }),
  chairmanHistoryController.updateChairmanHistoryById,
);
router.delete('/:id', authentication(), chairmanHistoryController.deleteChairmanHistoryById);

module.exports = router;
