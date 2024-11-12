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

    const result = await divisionModel.addDivision(newData);
    if (!result) {
      throw new Error('Failed to add division');
    }
    return result;
  } catch (error) {
    console.error('Error adding division:', error);
    throw error;
  }
};

exports.getAllDivisions = async () => {
  try {
    const divisions = await divisionModel.getAllDivisions();
    return divisions;
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error;
  }
};

exports.getDivisionBySlug = async (slug) => {
  try {
    const division = await divisionModel.getDivisionBySlug(slug);
    if (!division) {
      const error = new Error('Division not found.');
      error.statusCode = 404;
      throw error;
    }
    return division;
  } catch (error) {
    console.error('Error fetching division by slug: ', error);
    throw error;
  }
};

exports.updateDivisionBySlug = async (slug, updateData, imageFile) => {
  try {
    const oldData = await divisionModel.getDivisionBySlug(slug);
    if (!oldData) {
      const error = new Error('Division not found.');
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

    const updatedDivision = await divisionModel.updateDivisionBySlug(
      slug,
      newUpdateData,
    );
    if (!updatedDivision) {
      throw new Error('Failed to update division');
    }
    return updatedDivision;
  } catch (error) {
    console.error('Error updating division by slug:', error);
    throw error;
  }
};

exports.deleteDivisionBySlug = async (slug) => {
  try {
    const division = await divisionModel.getDivisionBySlug(slug);
    if (!division) {
      const error = new Error('Division not found.');
      error.statusCode = 404;
      throw error;
    }

    if (division.image) {
      await deleteFile(division.image);
    }

    const deletedDivision = await divisionModel.deleteDivisionBySlug(slug);
    if (!deletedDivision) {
      throw new Error('Failed to delete division');
    }
    return deletedDivision;
  } catch (error) {
    console.error('Error deleting division by slug:', error);
    throw error;
  }
};
