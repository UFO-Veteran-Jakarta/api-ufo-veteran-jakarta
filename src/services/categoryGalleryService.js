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
exports.updateCategoryGalleryById = async (id, updateData) => {
  try {
    // Update data in the database
    const result = await updateCategoryGalleryById(id, updateData);

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
