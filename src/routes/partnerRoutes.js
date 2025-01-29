const express = require('express');
const partnerController = require('../controllers/partnerController');

const {
  postPartnerValidationRules,
  validate,
} = require('../validators/partnerValidator');
const { authentication } = require('../middlewares/authMiddleware');
const {
  checkFile,
  checkUpdateFile,
} = require('../middlewares/partnerMiddlewareFile');

const router = express.Router();

router.post(
  '/',
  authentication(),
  checkFile('logo'),
  postPartnerValidationRules(),
  validate,
  partnerController.uploadPartner,
);

router.get(
  '/',
  partnerController.getAllPartners,
  partnerController.getPartnerById,
);

router.get(
  '/:id',
  partnerController.getPartnerById,
);

router.put(
  '/',
  authentication(),
  checkUpdateFile('logo'),
  postPartnerValidationRules(),
  validate,
  partnerController.updatePartnerById,
);

router.patch(
  '/',
  authentication(),
  checkUpdateFile('logo'),
  postPartnerValidationRules(),
  validate,
  partnerController.updatePartnerById,
);

router.delete('/', authentication(), partnerController.deletePartnerById);

module.exports = router;
