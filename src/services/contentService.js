const {
  getAllContent,
  addContent,
  getContentById,
  updateContent,
  deleteContent,
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

exports.deleteContent = async (id) => {
  return deleteContent(id);
};
