const express = require('express');
const workProgramController = require('../controllers/workProgramController');

const {
  postWorkProgramValidationRules,
  validate,
} = require('../validators/workProgramValidator');
const { authentication } = require('../middlewares/authMiddleware');
const {
  checkFile,
  checkFileForUpdate,
} = require('../middlewares/workProgramMiddlewareFile');

const router = express.Router();

router.post(
  '/',
  authentication(),
  checkFile('image'),
  postWorkProgramValidationRules(),
  validate,
  workProgramController.addWorkProgram,
);

router.get(
  '/',
  workProgramController.getAllWorkPrograms,
  workProgramController.getWorkProgramById,
);

router.get(
  '/:id',
  workProgramController.getWorkProgramById,
);

router.put(
  '/',
  authentication(),
  checkFileForUpdate('image'),
  postWorkProgramValidationRules(),
  validate,
  workProgramController.updateWorkProgramById,
);

router.patch(
  '/',
  authentication(),
  checkFileForUpdate('image'),
  postWorkProgramValidationRules(),
  validate,
  workProgramController.updateWorkProgramById,
);

router.delete(
  '/',
  authentication(),
  workProgramController.deleteWorkProgramById,
);

module.exports = router;
