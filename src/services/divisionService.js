const divisionModel = require('../models/divisionModel');
const { createSlugDivision } = require('../helpers/slug');
const { uploadFile, deleteFile } = require('../utils/fileUtils');

const checkSlugExistsInDb = (slug) =>
  divisionModel.getDivisionBySlug(slug, false).then((division) => !!division);

exports.addDivision = async (divisionData, imageFile) => {
  try {
    const newData = { ...divisionData };
    newData.slug = await createSlugDivision(newData.name, checkSlugExistsInDb);

    if (imageFile) {
      const imagePath = await uploadFile(imageFile, '/images/divisions/');
      if (imagePath) {
        newData.image = imagePath;
      }
    }

    return divisionModel.addDivision(newData);
  } catch (error) {
    console.error('Error adding division:', error);
    throw error;
  }
};

exports.getAllDivisions = () =>
  divisionModel.getAllDivisions().catch((error) => {
    console.error('Error fetching divisions:', error);
    throw error;
  });

exports.getDivisionBySlug = (slug) =>
  divisionModel.getDivisionBySlug(slug).catch((error) => {
    console.error('Error fetching division by slug: ', error);
    throw error;
  });

exports.updateDivisionBySlug = async (slug, updateData, imageFile) => {
  try {
    const oldData = await divisionModel.getDivisionBySlug(slug);
    if (!oldData) {
      const error = new Error('Division not found');
      error.statusCode = 404;
      throw error;
    }

    const newUpdateData = { ...updateData };

    if (newUpdateData.name) {
      newUpdateData.slug = await createSlugDivision(
        newUpdateData.name,
        checkSlugExistsInDb,
      );
    }

    if (imageFile) {
      const newImagePath = await uploadFile(imageFile, '/images/divisions/');
      if (newImagePath) {
        if (oldData.image) {
          await deleteFile(oldData.image);
        }
        newUpdateData.image = newImagePath;
      }
    }

    return divisionModel.updateDivisionBySlug(slug, newUpdateData);
  } catch (error) {
    console.error('Error updating division by slug:', error);
    throw error;
  }
};

exports.deleteDivisionBySlug = async (slug) => {
  try {
    const division = await divisionModel.getDivisionBySlug(slug);
    if (!division) {
      const error = new Error('Division not found');
      error.statusCode = 404;
      throw error;
    }

    if (division.image) {
      await deleteFile(division.image);
    }

    return divisionModel.deleteDivisionBySlug(slug);
  } catch (error) {
    console.error('Error deleting division by slug:', error);
    throw error;
  }
};
