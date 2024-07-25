const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const { addEvent, getAllEvents } = require("../services/eventService");
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

exports.getAllEvents = async (req, res) => {
  try {
    const events = await getAllEvents();
    logger.info("Successfully Get All Events");
    return sendResponse(res, 200, "Successfully Get All Events", events);
  } catch (error) {
    logger.error("Failed to Get All Events");
    return sendResponse(res, 500, "Failed to Get All Events");
  }
};
