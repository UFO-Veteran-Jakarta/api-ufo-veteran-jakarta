const express = require('express');
const fieldValidationRules = require('../utils/founderMemberFieldValidator');
const fields = require('../validators/founderMemberValidator');
const { authentication } = require('../middlewares/authMiddleware');
const founderMemberController = require('../controllers/founderMemberController');

const router = express.Router();

router.post(
  '/',
  authentication(),
  fieldValidationRules({ fields }),
  founderMemberController.addFounderMember,
);

router.get(
  '/',
  founderMemberController.getAllFounderMembers,
);

router.get('/:id', founderMemberController.getFounderMemberById);

router.put(
  '/:id',
  authentication(),
  fieldValidationRules({ fields, areRequired: false }),
  founderMemberController.updateFounderMemberById,
);

router.patch(
  '/:id',
  authentication(),
  fieldValidationRules({ fields, areRequired: false }),
  founderMemberController.updateFounderMemberById,
);

router.delete(
  '/:id',
  authentication(),
  founderMemberController.deleteFounderMemberById,
);

module.exports = router;
