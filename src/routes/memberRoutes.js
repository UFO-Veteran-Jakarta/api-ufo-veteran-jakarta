const express = require('express');

const {
  postMemberValidationRules,
  updateMemberValidationRules,
  validate,
} = require('../validators/memberValidator');

const memberController = require('../controllers/memberController');
const { authentication } = require('../middlewares/authMiddleware');
const { checkFileMember } = require('../middlewares/memberMiddlewareFile');

const router = express.Router();

router.get(
  '/',
  memberController.getAllMembers,
);

router.get(
  '/:id',
  memberController.getMemberById,
);

router.post(
  '/',
  authentication(),
  postMemberValidationRules(),
  validate,
  checkFileMember('image'),
  memberController.addMember,
);

router.patch(
  '/:id',
  authentication(),
  checkFileMember('image', false, 'update'),
  updateMemberValidationRules(),
  validate,
  memberController.updateMemberById,
);

router.delete(
  '/:id',
  authentication(),
  memberController.deleteMemberById,
);

module.exports = router;
