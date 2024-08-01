const express = require('express');
const eventController = require('../controllers/eventController');

const {
  postValidationRules,
  validate,
} = require('../validators/eventValidator');
const { authentication } = require('../middlewares/authMiddleware');
const {
  checkFile,
  checkFileForUpdate,
} = require('../middlewares/eventMiddlewareFile');

const router = express.Router();

router.post(
  '/',
  authentication(),
  checkFile('cover'),
  checkFile('cover_landscape'),
  postValidationRules(),
  validate,
  eventController.uploadEvent,
);

router.get('/', eventController.getAllEvents);
router.get('/:slug', eventController.getEventBySlug);

router.put(
  '/:slug',
  authentication(),
  checkFileForUpdate('cover'),
  checkFileForUpdate('cover_landscape'),
  postValidationRules(),
  validate,
  eventController.updateEvent,
);

router.delete('/:slug', authentication(), eventController.deleteEventBySlug);

module.exports = router;
