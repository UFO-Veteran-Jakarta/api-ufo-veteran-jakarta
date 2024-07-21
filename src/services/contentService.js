const {
  getAllContent,
  addContent,
  getContentById,
  updateContent,
  deleteContent,
} = require("../models/contentModel");
exports.getAll = async () => {
  return await getAllContent();
};
exports.getContentById = async (id) => {
  return await getContentById(id);
};
exports.addContent = async (data) => {
  return await addContent(data);
};
exports.updateContent = async (id, link) => {
  return await updateContent(id, link);
};

exports.deleteContent = async (id) => {
  return await deleteContent(id);
};
