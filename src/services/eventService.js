const {
  addEvent,
  getAllEvents,
  getEventBySlug,
} = require("../models/eventModel");

exports.addEvent = async (data) => {
  return await addEvent(data);
};

exports.getAllEvents = async () => {
  try {
    return await getAllEvents();
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

exports.getEventBySlug = async (slug) => {
  try {
    return await getEventBySlug(slug);
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    throw error;
  }
};
