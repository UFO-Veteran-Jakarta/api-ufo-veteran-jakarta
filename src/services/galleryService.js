const {
  addGallery,
  getAllGalleries,
  getGalleryBySlug,
  updateGalleryBySlug,
  deleteGalleryBySlug,
} = require('../models/galleryModel');
const {
  formatGallery,
  formatGalleries
} = require('../collections/galleryCollection');
const { createUniqueSlug } = require('../helpers/slug');
const {
  uploadImage,
  updateImage,
  deleteImage,
} = require('../utils/cloudImage');

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

/**
 * Add new gallery into the database.
 *
 * @param {*} data
 * @returns
 */
exports.addGallery = async (req) => {
  try {
    req.body.slug = await createUniqueSlug(
      req.body.title,
      checkSlugExistsInDb,
    );

    if (req.files?.image) {
      const imagePath = await uploadImage(req.files.image, 'galleries');
      if (imagePath) {
        req.body.image = imagePath.secure_url;
      }
    }

    const result = await addGallery(req.body);

    const formattedResult = formatGallery(result);

    return formattedResult;
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

    const formattedResult = formatGalleries(galleries);

    return formattedResult;
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
    const gallery = await getGalleryBySlug(slug);

    const formattedResult = formatGallery(gallery);

    return formattedResult;
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
exports.updateGalleryBySlug = async (slug, oldData, req) => {
  try {
    if (req.body?.title) {
      req.body.slug = await createUniqueSlug(
        req.body.title,
        checkSlugExistsInDb,
      );
    }

    // Update image file if propagated
    if (req.files?.image) {
      const imagePath = await updateImage(oldData.image, req.files.image, 'galleries');
      if (imagePath) {
        req.body.image = imagePath;
      }
    }

    // Update data in the database
    const result = await updateGalleryBySlug(slug, req.body);

    return [req.body, result];
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

    await deleteImage(result.image, 'galleries');

    return result;
  } catch (error) {
    console.error('Error deleting gallery by slug:', error);
    throw error;
  }
};
