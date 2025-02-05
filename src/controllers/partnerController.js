const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const {
  addPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
} = require('../services/partnerService');
const { uploadSingle } = require('../utils/uploadFile');

exports.uploadPartner = async (req, res) => {
  try {
    const logoUplaod = await uploadSingle(req.files.logo, 'logo');

    req.body.logo = logoUplaod.secure_url;

    const result = await addPartner(req.body);
    logger.info('Add Success: Success Add Partner');
    return sendResponse(res, 200, 'Successfully Add New Partner', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Partner');
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllPartners = async (req, res, next) => {
  try {
    if (req.query.id) {
      return next();
    }

    const partners = await getAllPartners();
    logger.info('Successfully Get All Partners');
    return sendResponse(res, 200, 'Successfully Get All Partners', partners);
  } catch (error) {
    logger.error('Failed to Get All Partners', error);
    return sendResponse(res, 500, 'Failed to Get All Partners');
  }
};

exports.getPartnerById = async (req, res) => {
  try {
    let id;
    if (req.query?.id) {
      id = req.query.id;
    }

    if (req.params?.id) {
      id = req.params.id;
    }

    const partner = await getPartnerById(id);

    if (!partner) {
      logger.error(`Partner with id ${id} not found`);
      return sendResponse(res, 404, 'Partner not found');
    }

    logger.info(`Successfully Get Partner with id ${id}`);
    return sendResponse(res, 200, 'Successfully Get Partner', partner);
  } catch (error) {
    logger.error('Failed to Get Partner');
    return sendResponse(res, 500, error.message);
  }
};

exports.updatePartnerById = async (req, res) => {
  try {
    const { id } = req.query;

    const partner = await getPartnerById(id);

    if (!partner) {
      logger.error(`Partner with id ${id} not found`);
      return sendResponse(res, 404, 'Partner not found');
    }

    if (req.files?.logo) {
      const logoUpload = await uploadSingle(req.files.logo, 'logo');
      req.body.logo = logoUpload.secure_url;
    }

    const updatedPartner = await updatePartner(id, req.body);

    logger.info(`Successfully Update Partner with id ${id}`);
    return sendResponse(
      res,
      200,
      'Successfully Update Partner',
      updatedPartner,
    );
  } catch (error) {
    logger.error('Failed to Update Partner');
    return sendResponse(res, 500, error.message);
  }
};

exports.deletePartnerById = async (req, res) => {
  try {
    const { id } = req.query;

    const partner = await getPartnerById(id);

    if (!partner) {
      logger.error(`Partner with id ${id} not found`);
      return sendResponse(res, 404, 'Partner not found');
    }

    await deletePartner(id);

    logger.info(`Successfully Delete Partner with id ${id}`);
    return sendResponse(res, 200, 'Successfully Delete Partner');
  } catch (error) {
    logger.error('Failed to Delete Partner');
    return sendResponse(res, 500, error.message);
  }
};
