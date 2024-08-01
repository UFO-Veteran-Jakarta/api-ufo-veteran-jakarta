const {
  addEvent,
  getAllEvents,
  getEventBySlug,
  updateEventInDb,
  softDeleteEventBySlug,
} = require('../models/eventModel');

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

exports.deleteEvent = async (slug) => {
  return softDeleteEventBySlug(slug);
};
