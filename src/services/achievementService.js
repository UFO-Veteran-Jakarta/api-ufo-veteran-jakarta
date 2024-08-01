const {
  addAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
} = require('../models/achievementsModel');

exports.addAchievemnt = async (data) => {
  return addAchievement(data);
};

exports.getAllAchievements = async () => {
  try {
    return await getAllAchievements();
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

exports.getAchievementById = async (id) => {
  return getAchievementById(id);
};

exports.updateAchievement = async (id, data) => {
  return updateAchievement(id, data);
};

exports.deleteAchievement = async (id) => {
  return deleteAchievement(id);
};
