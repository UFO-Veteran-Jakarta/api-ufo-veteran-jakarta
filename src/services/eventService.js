const { addEvent, getAllEvents } = require("../models/eventModel");

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
