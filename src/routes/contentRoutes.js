const express = require('express');
const contentController = require('../controllers/contentController');

const fieldValidationRules = require('../utils/fieldValidator');
const fields = require('../validators/contentValidator');
const { authentication } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/',
  authentication(),
  fieldValidationRules({ fields }),
  contentController.addContent,
);

router.get('/', contentController.getAllContents);

router.get(
  '/:id',
  contentController.getContentById,
);

router.put( // Backwards compatibility
  '/',
  authentication(),
  fieldValidationRules({ fields, areRequired: false }),
  contentController.updateContentById,
);
router.patch(
  '/:id',
  authentication(),
  fieldValidationRules({ fields, areRequired: false }),
  contentController.updateContentById,
);

router.delete( // Backwards compatibility
  '/',
  authentication(),
  contentController.deleteContentById,
);
router.delete(
  '/:id',
  authentication(),
  contentController.deleteContentById,
);

module.exports = router;
