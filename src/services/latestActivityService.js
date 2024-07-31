const {
  addLatestActivity,
  getAllLatestActivities,
  getLatestActivityById,
  updateLatestActivity,
  deleteLatestActivity,
} = require('../models/latestActivityModel');

exports.addLatestActivity = async (data) => {
  return addLatestActivity(data);
};

exports.getAllLatestActivities = async () => {
  try {
    return await getAllLatestActivities();
  } catch (error) {
    console.error('Error fetching latest activities: ', error);
    throw error;
  }
};

exports.getLatestActivityById = async (id) => {
  return getLatestActivityById(id);
};

exports.updateLatestActivity = async (id, data) => {
  return updateLatestActivity(id, data);
};

exports.deleteLatestActivity = async (id) => {
  return deleteLatestActivity(id);
};
