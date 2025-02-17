const {
  getAllContents,
  addContent,
  getContentById,
  updateContentById,
  deleteContentById,
} = require('../models/contentModel');
const {
  formatContent,
  formatContents,
} = require('../collections/contentCollection');
const {
  uploadImage,
  updateImage,
  deleteImage,
} = require('../utils/cloudImage');

exports.getAllContents = async () => {
  try {
    const result = await getAllContents();

    const formattedResult = formatContents(result);

    return formattedResult;
  } catch (error) {
    console.error('Error fetching contents:', error);
    throw error;
  }
};

exports.getContentById = async (id) => {
  try {
    const result = await getContentById(id);

    const formattedResult = formatContent(result);

    return formattedResult;
  } catch (error) {
    console.error('Error fetching content by id: ', error);
    throw error;
  }
};

exports.addContent = async (req) => {
  try {
    if (req.files?.image) {
      const imagePath = await uploadImage(req.files.image, 'contents');
      if (imagePath) {
        req.body.image = imagePath.secure_url;
      }
    }

    const result = await addContent(req.body);

    const formattedResult = formatContent(result);

    return formattedResult;
  } catch (error) {
    console.error('Error adding content:', error);
    throw error;
  }
};

exports.updateContentById = async (id, oldData, req) => {
  try {
    // Update image file if propagated
    if (req.files?.image) {
      const imagePath = await updateImage(oldData.image, req.files.image, 'contents');
      if (imagePath) {
        req.body.image = imagePath;
      }
    }

    // Update data in the database, only if payload is present
    const result = Object.keys(req.body).length
      && await updateContentById(id, req.body);

    return [req.body, result];
  } catch (error) {
    console.error('Error updating content by id:', error);
    throw error;
  }
};

exports.deleteContentById = async (id) => {
  try {
    const result = await deleteContentById(id);

    await deleteImage(result.image, 'contents');

    const formattedResult = formatContent(result);

    return formattedResult;
  } catch (error) {
    console.error('Error deleting content by id:', error);
    throw error;
  }
};
