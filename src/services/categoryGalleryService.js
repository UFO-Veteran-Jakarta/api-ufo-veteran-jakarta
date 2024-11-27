const {
  addCategoryGallery,
  getAllCategoryGalleries,
  getCategoryGalleryById,
  updateCategoryGalleryById,
  deleteCategoryGalleryById,
} = require('../models/categoryGalleryModel');

/**
 * Add new category gallery into the database.
 *
 * @param {*} data
 * @returns
 */
exports.addCategoryGallery = async (data) => {
  try {
    const result = await addCategoryGallery(data);
    return result;
  } catch (error) {
    console.error('Error adding category gallery:', error);
    throw error;
  }
};

/**
 * Get all category gallery from database/cache.
 *
 * @returns
 */
exports.getAllCategoryGalleries = async () => {
  try {
    const galleries = await getAllCategoryGalleries();
    return galleries;
  } catch (error) {
    console.error('Error fetching category galleries:', error);
    throw error;
  }
};

/**
 * Get category gallery by id from database/cache.
 *
 * @param {*} id
 * @returns
 */
exports.getCategoryGalleryById = async (id) => {
  try {
    return await getCategoryGalleryById(id);
  } catch (error) {
    console.error('Error fetching category gallery by id: ', error);
    throw error;
  }
};

/**
 * Update category gallery by id on the database.
 *
 * @param {*} id
 * @param {*} oldData
 * @param {*} updateData
 * @returns
 */
exports.updateCategoryGalleryById = async (id, oldData, updateData) => {
  try {
    // Exclude imageData from updateData payload
    const { imageData, ...newData } = updateData;

    // Update data in the database
    const result = await updateCategoryGalleryById(id, newData);

    return result;
  } catch (error) {
    console.error('Error updating category gallery by id:', error);
    throw error;
  }
};

/**
 * Delete category gallery by id on the database.
 *
 * @param {*} id
 * @returns
 */
exports.deleteCategoryGalleryById = async (id) => {
  try {
    const result = await deleteCategoryGalleryById(id);
    return result;
  } catch (error) {
    console.error('Error deleting category gallery by id:', error);
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
exports.stageDataUpdateGalleryById = async (req) => {
  // Data payload
  const updateData = {};

  if (req.body.name) {
    updateData.name = req.body.name;
  }

  return [
    // Checks if there is a data update payload
    Object.keys(updateData).length !== 0,

    // Returns the data payload itself
    updateData,
  ];
};
