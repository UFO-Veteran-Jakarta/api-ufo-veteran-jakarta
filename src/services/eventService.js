const { addEvent } = require("../models/eventModel");

exports.addEvent = async (data) => {
  return await addEvent(data);
};
