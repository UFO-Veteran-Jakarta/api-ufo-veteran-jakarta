const {
  addGallery,
  getAllGalleries,
  getGalleryBySlug,
  updateGalleryBySlug,
  deleteGalleryBySlug,
} = require('../models/galleryModel');
const { createSlugDivision } = require('../helpers/slug');
const {
  getUploadFilepath,
  updateFileGallery,
} = require('../utils/uploadFileGallery');

/**
 * Checks if 'slug' index exists in the database.
 *
 * @param {*} slug
 * @returns
 */
const checkSlugExistsInDb = async (slug) => {
  const useCache = false;
  const gallery = await getGalleryBySlug(slug, useCache);
  return !! gallery;
};
exports.checkSlugExistsInDb = checkSlugExistsInDb;

/**
 * Add new gallery into the database.
 *
 * @param {*} data
 * @returns
 */
exports.addGallery = async (data) => {
  try {
    const result = await addGallery(data);
    return result;
  } catch (error) {
    console.error('Error adding gallery:', error);
    throw error;
  }
};

/**
 * Get all gallery from database/cache.
 *
 * @returns
 */
exports.getAllGalleries = async () => {
  try {
    const galleries = await getAllGalleries();
    return galleries;
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
};

/**
 * Get gallery by slug from database/cache.
 *
 * @param {*} slug
 * @returns
 */
exports.getGalleryBySlug = async (slug) => {
  try {
    return await getGalleryBySlug(slug);
  } catch (error) {
    console.error('Error fetching gallery by slug: ', error);
    throw error;
  }
};

/**
 * Update gallery by slug on the database.
 *
 * @param {*} slug
 * @param {*} oldData
 * @param {*} updateData
 * @returns
 */
exports.updateGalleryBySlug = async (slug, oldData, updateData) => {
  try {
    // Exclude imageData from updateData payload
    const { imageData, ...newData } = updateData;

    // Update data in the database
    const result = await updateGalleryBySlug(slug, newData);

    // Update image file if propagated
    if (updateData?.image) {
      await updateFileGallery(oldData.image, updateData.image, imageData);
    }

    return result;
  } catch (error) {
    console.error('Error updating gallery by slug:', error);
    throw error;
  }
};

/**
 * Delete gallery by slug on the database.
 *
 * @param {*} slug
 * @returns
 */
exports.deleteGalleryBySlug = async (slug) => {
  try {
    const result = await deleteGalleryBySlug(slug);
    return result;
  } catch (error) {
    console.error('Error deleting gallery by slug:', error);
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
exports.stageDataUpdateGalleryBySlug = async (req) => {
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
