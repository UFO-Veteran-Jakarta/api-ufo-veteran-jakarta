const logger = require("../utils/logger");
const { sendResponse } = require("../helpers/response");
const {
  addEvent,
  getAllEvents,
  getEventBySlug,
} = require("../services/eventService");
const { generateUniqueSlug } = require("../helpers/slug");
const { uploadSingle } = require("../utils/uploadFile");

exports.uploadEvent = async (req, res) => {
  try {
    req.body.slug = generateUniqueSlug(req.body.name);

    const coverUpload = await uploadSingle(req.files.cover, "cover");
    const converLandscapeUpload = await uploadSingle(
      req.files.cover_landscape,
      "cover_landscape"
    );

    req.body.cover = coverUpload.secure_url;
    req.body.cover_landscape = converLandscapeUpload.secure_url;

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

exports.getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      logger.error(`Event with slug ${slug} not found`);
      return sendResponse(res, 404, "Event not found");
    }

    logger.info(`Successfully Get Event with slug ${slug}`);
    return sendResponse(res, 200, "Successfully Get Event", event);
  } catch (error) {
    logger.error("Failed to Get Event");
    return sendResponse(res, 500, error.message);
  }
};
