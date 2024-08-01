const express = require('express');
const {
  postLatestActivityValidationRules,
  validate,
} = require('../validators/latestActivityValidator');
const { authentication } = require('../middlewares/authMiddleware');
const {
  checkFile,
  checkFileForUpdate,
} = require('../middlewares/latestActivityMiddlewareFile');
const latestActivityController = require('../controllers/latestActivityController');

const router = express.Router();

router.post(
  '/',
  authentication(),
  checkFile('image'),
  postLatestActivityValidationRules(),
  validate,
  latestActivityController.addLatestActivity,
);

router.get(
  '/',
  latestActivityController.getAllLatestActivities,
  latestActivityController.getLatestActivityById,
);

router.put(
  '/',
  authentication(),
  checkFileForUpdate('image'),
  postLatestActivityValidationRules(),
  validate,
  latestActivityController.updateLatestActivityById,
);

router.delete(
  '/',
  authentication(),
  latestActivityController.deleteLatestActivityById,
);

module.exports = router;
