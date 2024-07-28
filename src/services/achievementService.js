const {
  addAchievement,
  getAllAchievements,
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
