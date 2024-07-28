const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const {
  addPartner,
  getAllPartners,
  getPartnerById,
  updatePartner,
} = require("../services/partnerService");
const { uploadSingle } = require("../utils/uploadFile");

exports.uploadPartner = async (req, res) => {
  try {
    const logoUplaod = await uploadSingle(req.files.logo, "logo");

    req.body.logo = logoUplaod.secure_url;

    const result = await addPartner(req.body);
    logger.info("Add Success: Success Add Partner");
    return sendResponse(res, 200, "Successfully Add New Partner", result);
  } catch (error) {
    logger.error("Add Error: Failed Add Partner");
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllPartners = async (req, res, next) => {
  try {
    if (req.query.id) {
      return next();
    }

    const partners = await getAllPartners();
    logger.info("Successfully Get All Partners");
    return sendResponse(res, 200, "Successfully Get All Partners", partners);
  } catch (error) {
    logger.error("Failed to Get All Partners");
    return sendResponse(res, 500, "Failed to Get All Partners");
  }
};

exports.getPartnerById = exports.updatePartner = async (req, res) => {
  try {
    const { id } = req.query;
    const partner = await getPartnerById(id);

    if (!partner) {
      logger.error(`Partner with id ${id} not found`);
      return sendResponse(res, 404, "Partner not found");
    }

    logger.info(`Successfully Get Partner with id ${id}`);
    return sendResponse(res, 200, "Successfully Get Partner", partner);
  } catch (error) {
    logger.error("Failed to Get Partner");
    return sendResponse(res, 500, error.message);
  }
};

exports.updatePartnerById = async (req, res) => {
  try {
    console.log("Request query:", req.query); // Menampilkan seluruh query request
    const id = req.query.id;
    console.log("ID:", id); // Menampilkan ID yang diambil dari query

    const partner = await getPartnerById(id);
    console.log("Partner:", partner); // Menampilkan partner yang didapatkan dari getPartnerById

    if (!partner) {
      logger.error(`Partner with id ${id} not found`);
      return sendResponse(res, 404, "Partner not found");
    }

    if (req.files?.logo) {
      const logoUpload = await uploadSingle(req.files.logo, "logo");
      req.body.logo = logoUpload.secure_url;
    }

    console.log("Request body:", req.body); // Menampilkan body request setelah logo diupload

    const updatedPartner = await updatePartner(id, req.body);
    console.log("Updated Partner:", updatedPartner); // Menampilkan partner yang telah diupdate

    logger.info(`Successfully Update Partner with id ${id}`);
    return sendResponse(
      res,
      200,
      "Successfully Update Partner",
      updatedPartner
    );
  } catch (error) {
    console.error("Error:", error); // Menampilkan error jika ada
    logger.error("Failed to Update Partner");
    return sendResponse(res, 500, error.message);
  }
};
