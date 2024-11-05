const {
  addDivision,
  getAllDivisions,
  getDivisionBySlug,
  updateDivisionBySlug,
  deleteDivisionBySlug,
} = require('../models/divisionModel');
const { createSlugDivision } = require('../helpers/slug');
const {
  getUploadFilepath,
  updateFileDivision,
} = require('../utils/uploadFileDivision');

/**
 * Checks if 'slug' index exists in the database.
 *
 * @param {*} slug
 * @returns
 */
exports.checkSlugExistsInDb = async (slug) => {
  const useCache = false;
  const division = await getDivisionBySlug(slug, useCache);
  return !!division;
};

/**
 * Add new division into the database.
 *
 * @param {*} data
 * @returns
 */
exports.addDivision = async (data) => {
  try {
    return addDivision(data);
  } catch (error) {
    console.error('Error adding divisions:', error);
    throw error;
  }
};

/**
 * Get all division from database/cache.
 *
 * @returns
 */
exports.getAllDivisions = async () => {
  try {
    const divisions = await getAllDivisions();
    return divisions;
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error;
  }
};

/**
 * Get division by slug from database/cache.
 *
 * @param {*} slug
 * @returns
 */
exports.getDivisionBySlug = async (slug) => {
  try {
    return await getDivisionBySlug(slug);
  } catch (error) {
    console.error('Error fetching division by slug: ', error);
    throw error;
  }
};

/**
 * Update division by slug on the database.
 *
 * @param {*} slug
 * @param {*} oldData
 * @param {*} updateData
 * @returns
 */
exports.updateDivisionBySlug = async (slug, oldData, updateData) => {
  try {
    // Exclude imageData from updateData payload
    const { imageData, ...newData } = updateData;

    // Update data in the database
    const result = await updateDivisionBySlug(slug, newData);

    // Update image file if propagated
    if (updateData?.image) {
      await updateFileDivision(
        oldData.image,
        updateData.image,
        imageData,
      );
    }

    return result;
  } catch (error) {
    console.error('Error updating division by slug:', error);
    throw error;
  }
};

/**
 * Delete division by slug on the database.
 *
 * @param {*} slug
 * @returns
 */
exports.deleteDivisionBySlug = async (slug) => {
  try {
    return deleteDivisionBySlug(slug);
  } catch (error) {
    console.error('Error deleting division by slug:', error);
    throw error;
  }
};

/*
 * @returns Array[boolean, Object]
 *
 * Stages the payload data before executing the next action.
 * On each payload objects, this function will return the
 * appropriate string value back to the data payload.
 */
exports.stageDataUpdateDivisionBySlug = async (req) => {
  // Data payload
  const updateData = {};

  if (req.body.name) {
    updateData.name = req.body.name;
    updateData.slug = await createSlugDivision(
      req.body.name,
      checkSlugExistsInDb,
    );
  }

  if (req.files?.image) {
    const imagePath = await getUploadFilepath(req.files.image);
    if (imagePath) {
      updateData.image = imagePath;
      updateData.imageData = req.files.image?.data;
    }
  }

  return [
    // Checks if there is a data update payload
    Object.keys(updateData).length !== 0,

    // Returns the data payload itself
    updateData,
  ];
};
