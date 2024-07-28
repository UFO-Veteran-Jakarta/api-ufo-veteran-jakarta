const { addAchievement } = require("../models/achievementsModel");

exports.addAchievemnt = async (data) => {
  return await addAchievement(data);
};
