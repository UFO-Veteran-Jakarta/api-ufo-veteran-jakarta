const { getAllContent, addContent } = require("../models/contentModel");
exports.getAll = async () => {
  return await getAllContent();
};
exports.addContent = async (data) => {
  return await addContent(data);
};
