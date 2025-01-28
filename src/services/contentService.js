const {
  getAllContent,
  addContent,
  getContentById,
  updateContent,
  updateContentById,
  deleteContent,
  getContentByIdParam,
} = require('../models/contentModel');

exports.getAll = async () => {
  return getAllContent();
};
exports.getContentById = async (id) => {
  return getContentById(id);
};
exports.addContent = async (data) => {
  return addContent(data);
};
exports.updateContent = async (id, link) => {
  return updateContent(id, link);
};

exports.getContentByIdParams = async (id) => {
  return getContentByIdParam(id);
};

exports.updateContentById = async (id, data) => {
  try {
    return await updateContentById(id, data);
  } catch (error) {
    console.error(`Error updating content with id ${id}:`, error);
    throw error;
  }
};

exports.deleteContent = async (id) => {
  return deleteContent(id);
};
