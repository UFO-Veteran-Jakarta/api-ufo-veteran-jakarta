const {
  addAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
} = require('../models/achievementsModel');

const { uploadSingle, updateFile } = require('../utils/uploadFile');

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

exports.updateAchievementById = async (id, oldData, updateData) => {
  try {
    let finalUpdateData = { ...updateData };

    // Handle file upload if there's a new logo
    if (updateData.logo) {
      const newLogoUrl = await updateFile(oldData.logo, updateData.logo);
      finalUpdateData.logo = newLogoUrl;
    }

    const result = await updateAchievement(id, finalUpdateData);
    return result;
  } catch (error) {
    console.error('Error updating achievement by ID:', error);
    throw error;
  }
};

exports.deleteAchievement = async (id) => {
  return deleteAchievement(id);
};

exports.StageDataUpdateAchievementById = async (req) => {
  try {
    const updateData = {};

    // Handle text fields
    if (req.body.name) {
      updateData.name = req.body.name;
    }

    if (req.body.year) {
      updateData.year = req.body.year;
    }

    // Handle logo file
    if (req.files && req.files.logo) {
      updateData.logo = req.files.logo; // Pass the raw file object
    }

    const hasUpdates = Object.keys(updateData).length > 0;
    return [hasUpdates, updateData];
  } catch (error) {
    throw new Error(`Error staging update data: ${error.message}`);
  }
};