const express = require('express');
const achievementController = require('../controllers/achievementController');

const {
  postAchievementValidationRules,
  validate,
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
);

router.get(
  '/:id',
  achievementController.getAchievementById,
);

router.put(
  '/',
  authentication(),
  checkUpdateFile('logo'),
  postAchievementValidationRules(),
  validate,
  achievementController.updateAchievementById,
);

router.delete(
  '/',
  authentication(),
  achievementController.deleteAchievementById,
);

module.exports = router;
