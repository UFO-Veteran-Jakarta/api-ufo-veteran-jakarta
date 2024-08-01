const express = require('express');
const contentController = require('../controllers/contentController');

const {
  postValidationRules,
  validate,
} = require('../validators/contentValidator');
const { authentication } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
  '/',
  authentication(),
  postValidationRules(),
  validate,
  contentController.addContent,
);

router.get('/', contentController.getAll);

router.put(
  '/',
  authentication(),
  postValidationRules(),
  validate,
  contentController.updateContent,
);
router.delete('/', authentication(), contentController.deleteContent);

router.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Unauthorized');
  } else {
    next(err);
  }
});

module.exports = router;
