const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const { addEvent } = require("../services/eventService");
const { generateUniqueSlug } = require("../helpers/slug");

exports.uploadEvent = async (req, res) => {
  try {
    // return sendResponse(res, 200, "wow", req.body);
    req.body.slug = generateUniqueSlug(req.body.name);

    const result = await addEvent(req.body);
    console.log("INIT", result);
    logger.info("Add Success: Success Add Event");
    return sendResponse(res, 200, "Successfully Add New Event", result);
  } catch (error) {
    logger.error("Add Error: Failed Add Event");
    return sendResponse(res, 500, error.message);
  }
};
