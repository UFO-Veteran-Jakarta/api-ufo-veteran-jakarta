const express = require('express');
const achievementController = require('../controllers/achievementController');

const {
  postAchievementValidationRules,
  validate,
  updateAchievementValidationRules,
} = require('../validators/achievementValidator');

const { authentication } = require('../middlewares/authMiddleware');
const {
  checkFile,
  checkUpdateFile,
} = require('../middlewares/achievementMiddlewareFile');

const router = express.Router();

router.post(
  '/',
  authentication(),
  checkFile('logo'),
  postAchievementValidationRules(),
  validate,
  achievementController.addAchievement,
);

router.get(
  '/',
  achievementController.getAllAchievements,
  achievementController.getAchievementById,
);

router.get(
  '/:id',
  achievementController.getAchievementByIdParams,
);

router.put(
  '/',
  authentication(),
  checkUpdateFile('logo'),
  postAchievementValidationRules(),
  validate,
  achievementController.updateAchievementById,
);

router.patch(
  '/:id',
  authentication(),
  checkUpdateFile('logo'),
  updateAchievementValidationRules(),
  validate,
  achievementController.updateAchievementByIdParams,
);

router.delete(
  '/',
  authentication(),
  achievementController.deleteAchievementById,
);

module.exports = router;
