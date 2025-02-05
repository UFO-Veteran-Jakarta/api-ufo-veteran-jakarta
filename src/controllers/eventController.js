const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const {
  addEvent,
  getAllEvents,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  updateEventBySlug,
  stageUpdateEventBySlug,
} = require('../services/eventService');
const { generateUniqueSlug } = require('../helpers/slug');
const { uploadSingle } = require('../utils/uploadFile');
const { buildResponse } = require('../utils/buildResponseEvent');

exports.uploadEvent = async (req, res) => {
  try {
    req.body.slug = generateUniqueSlug(req.body.name);

    const coverUpload = await uploadSingle(req.files.cover, 'cover');
    const converLandscapeUpload = await uploadSingle(
      req.files.cover_landscape,
      'cover_landscape',
    );

    req.body.cover = coverUpload.secure_url;
    req.body.cover_landscape = converLandscapeUpload.secure_url;

    const result = await addEvent(req.body);
    logger.info('Add Success: Success Add Event');
    return sendResponse(res, 200, 'Successfully Add New Event', result);
  } catch (error) {
    logger.error('Add Error: Failed Add Event');
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await getAllEvents();
    logger.info('Successfully Get All Events');
    return sendResponse(res, 200, 'Successfully Get All Events', events);
  } catch (error) {
    logger.error('Failed to Get All Events');
    return sendResponse(res, 500, 'Failed to Get All Events');
  }
};

exports.getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const event = await getEventBySlug(slug);

    if (!event) {
      logger.error(`Event with slug ${slug} not found`);
      return sendResponse(res, 404, 'Event not found');
    }

    logger.info(`Successfully Get Event with slug ${slug}`);
    return sendResponse(res, 200, 'Successfully Get Event', event);
  } catch (error) {
    logger.error('Failed to Get Event');
    return sendResponse(res, 500, error.message);
  }
};

exports.updateEvent = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return sendResponse(res, 404, 'Event Not Found');
  }

  try {
    const existingEvent = await getEventBySlug(slug);

    if (!existingEvent) {
      logger.error(`Event with slug ${slug} not found`);
      return sendResponse(res, 404, 'Event Not Found');
    }

    if (req.body.name) {
      req.body.slug = generateUniqueSlug(req.body.name);
    }

    if (req?.files?.cover) {
      const coverUpload = await uploadSingle(req.files.cover, 'cover');
      req.body.cover = coverUpload.secure_url;
    }

    if (req?.files?.cover_landscape) {
      const coverLandscapeUpload = await uploadSingle(
        req.files.cover_landscape,
        'cover_landscape',
      );
      req.body.cover_landscape = coverLandscapeUpload.secure_url;
    }

    const updatedEvent = await updateEvent(slug, req.body);

    logger.info(`Successfully updated event with slug ${slug}`);
    return sendResponse(res, 200, 'Successfully Edit This Event', updatedEvent);
  } catch (error) {
    logger.error(`Failed to update event with slug ${slug}: ${error.message}`);
    return sendResponse(res, 500, error.message);
  }
};

exports.updateEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const oldData = await getEventBySlug(slug);

    if (!oldData) {
      logger.error(`Event with slug ${slug} not found`);
      return sendResponse(res, 404, 'Event not found');
    }

    const [hasUpdates, updateData] = await stageUpdateEventBySlug(req);

    if (!hasUpdates) {
      return sendResponse(res, 400, 'No update data provided');
    }

    const updatedEvent = await updateEventBySlug(slug, oldData, updateData);

    const [responseMessage, responseData] = await buildResponse(
      oldData,
      updateData,
      updatedEvent,
    );

    logger.info(`Successfully updated event with slug ${slug}`);
    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    logger.error('Failed to update event with slug');
    return sendResponse(res, 500, error.message);
  }
};

exports.deleteEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await deleteEvent(slug);

    if (!result) {
      return res.status(404).json({
        status: 404,
        message: 'Event Not Found',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: 'Failed to Delete This Event',
    });
  }
};
