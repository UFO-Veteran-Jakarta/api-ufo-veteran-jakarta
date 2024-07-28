const {
  addAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
} = require("../models/achievementsModel");

exports.addAchievemnt = async (data) => {
  return await addAchievement(data);
};

exports.getAllAchievements = async () => {
  try {
    return await getAllAchievements();
  } catch (error) {
    console.error("Error fetching achievements:", error);
    throw error;
  }
};

exports.getAchievementById = async (id) => {
  return await getAchievementById(id);
};

exports.updateAchievement = async (id, data) => {
  return await updateAchievement(id, data);
};

exports.deleteAchievement = async (id) => {
  return await updateAchievement(id); // ini nanti diganti
};
