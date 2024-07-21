const contentService = require("../services/contentService");
const { sendResponse } = require("../helpers/response");

const logger = require("../utils/logger");

exports.getAll = async (req, res) => {
  const p = await contentService.getAll();
  console.log(p);
};

exports.addContent = async (req, res) => {
  try {
    const result = await contentService.addContent(req.body);
    logger.info("Add Success: Success Add Content");
    return sendResponse(res, 200, "Successfully Add New Content", result);
  } catch (error) {
    logger.error("Add Error: Failed Add Content");
    return sendResponse(res, 500, error.message);
  }
};
