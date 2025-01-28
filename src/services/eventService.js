const {
  addEvent,
  getAllEvents,
  getEventBySlug,
  updateEventInDb,
  softDeleteEventBySlug,
} = require('../models/eventModel');
const { updateFile } = require('../utils/uploadFile');
const { generateUniqueSlug } = require('../helpers/slug');

exports.addEvent = async (data) => {
  return addEvent(data);
};

exports.getAllEvents = async () => {
  try {
    return await getAllEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

exports.getEventBySlug = async (slug) => {
  try {
    return await getEventBySlug(slug);
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    throw error;
  }
};

exports.updateEvent = async (slug, data) => {
  return updateEventInDb(slug, data);
};


exports.updateEventBySlug = async (slug, oldData, updateData) => {
  try {
    const finalUpdateData = { ...updateData };

    if (updateData.cover) {
      const coverUrl = await updateFile(
        oldData.cover,
        updateData.cover,
        'cover',
      );
      finalUpdateData.cover = coverUrl;
    }

    if (updateData.cover_landscape) {
      const coverLandscapeUrl = await updateFile(
        oldData.cover_landscape,
        updateData.cover_landscape,
        'cover_landscape',
      );
      finalUpdateData.cover_landscape = coverLandscapeUrl;
    }

    const result = await updateEventInDb(slug, finalUpdateData);
    return result;
  } catch (error) {
    console.error('Error updating event by slug:', error);
    throw error;
  }
};


exports.deleteEvent = async (slug) => {
  return softDeleteEventBySlug(slug);
};

exports.stageUpdateEventBySlug = async (req) => {
  try {
    const updateData = {};

    if (req.body.name) {
      updateData.name = req.body.name;
      updateData.slug = generateUniqueSlug(req.body.name);
    }
    if (req.body.start_event_date) {
      updateData.start_event_date = req.body.start_event_date;
    }
    if (req.body.end_event_date) {
      updateData.end_event_date = req.body.end_event_date;
    }
    if (req.body.start_event_time) {
      updateData.start_event_time = req.body.start_event_time;
    }
    if (req.body.end_event_time) {
      updateData.end_event_time = req.body.end_event_time;
    }
    if (req.body.registration_start_date) {
      updateData.registration_start_date = req.body.registration_start_date;
    }
    if (req.body.registration_end_date) {
      updateData.registration_end_date = req.body.registration_end_date;
    }
    if (req.body.registration_start_time) {
      updateData.registration_start_time = req.body.registration_start_time;
    }
    if (req.body.registration_end_time) {
      updateData.registration_end_time = req.body.registration_end_time;
    }
    if (req.body.body) {
      updateData.body = req.body.body;
    }
    if (req.body.snippets) {
      updateData.snippets = req.body.snippets;
    }
    if (req.body.link_registration) {
      updateData.link_registration = req.body.link_registration;
    }
    if (req.body.location) {
      updateData.location = req.body.location;
    }

    // Handle file uploads
    if (req.files?.cover) {
      updateData.cover = req.files.cover;
    }
    if (req.files?.cover_landscape) {
      updateData.cover_landscape = req.files.cover_landscape;
    }

    const hasUpdates = Object.keys(updateData).length > 0;

    return [hasUpdates, updateData];
  } catch (error) {
    throw new Error(`Error staging update data: ${error.message}`);
  }
};