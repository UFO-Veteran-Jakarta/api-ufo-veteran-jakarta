const {
  addArticle,
  getAllArticles,
  getArticleBySlug,
  updateArticleBySlug,
  deleteArticleBySlug,
} = require('../models/articleModel');
const pool = require('../config/database');
const { createSlugDivision } = require('../helpers/slug');
const {
  getUploadFilepath,
  updateFileArticle,
} = require('../utils/uploadFileArticle');

/**
 * Checks if 'slug' index exists in the database.
 *
 * @param {*} slug
 * @returns
 */
const checkSlugExistsInDb = async (slug) => {
  const query = 'SELECT COUNT(*) FROM articles WHERE slug = $1';
  const result = await pool.query(query, [slug]);
  return parseInt(result.rows[0].count, 10) > 0;
};

exports.checkSlugExistsInDb = checkSlugExistsInDb;

/**
 * Add new article into the database.
 *
 * @param {*} data
 * @returns
 */
exports.addArticle = async (data) => {
  try {
    const result = await addArticle(data);
    return result;
  } catch (error) {
    console.error('Error adding article:', error);
    throw error;
  }
};

/**
 * Get all division from database/cache.
 *
 * @returns
 */
exports.getAllArticles = async () => {
  try {
    const articles = await getAllArticles();
    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

/**
 * Get division by slug from database/cache.
 *
 * @param {*} slug
 * @returns
 */
exports.getArticleBySlug = async (slug) => {
  try {
    return await getArticleBySlug(slug);
  } catch (error) {
    console.error('Error fetching article by slug: ', error);
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
exports.updateArticleBySlug = async (slug, oldData, updateData) => {
  try {
    // Exclude imageData from updateData payload
    const { imageCoverData, imageCoverLandscapeData, ...newData } = updateData;

    // Update data in the database
    const result = await updateArticleBySlug(slug, newData);
    // Update image file if propagated
    if (updateData?.cover) {
      await updateFileArticle(oldData.cover, updateData.cover, imageCoverData);
    }
    if (updateData?.cover_landscape) {
      await updateFileArticle(
        oldData.cover_landscape,
        updateData.cover_landscape,
        imageCoverLandscapeData,
      );
    }
    return result;
  } catch (error) {
    console.error('Error updating article by slug:', error);
    throw error;
  }
};

/**
 * Delete division by slug on the database.
 *
 * @param {*} slug
 * @returns
 */
exports.deleteArticleBySlug = async (slug) => {
  try {
    const result = await deleteArticleBySlug(slug);
    return result;
  } catch (error) {
    console.error('Error deleting article by slug:', error);
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
exports.stageDataUpdateArticleBySlug = async (req) => {
  // Data payload
  const updateData = {};

  if (req.body.title) {
    updateData.title = req.body.title;
    updateData.slug = await createSlugDivision(
      req.body.title,
      checkSlugExistsInDb,
    );
  }

  if (req.body.category_id) {
    updateData.category_id = req.body.category_id;
  }

  if (req.body.author) {
    updateData.author = req.body.author;
  }

  if (req.body.snippets) {
    updateData.snippets = req.body.snippets;
  }

  if (req.body.body) {
    updateData.body = req.body.body;
  }

  if (req.files?.cover) {
    const imagePathCover = await getUploadFilepath(req.files.cover, 'cover');
    if (imagePathCover) {
      updateData.cover = imagePathCover;
      updateData.imageCoverData = req.files.cover?.data;
    }
  }

  if (req.files?.cover_landscape) {
    const imagePathCoverLandscape = await getUploadFilepath(req.files.cover_landscape, 'cover_landscape');
    if (imagePathCoverLandscape) {
      updateData.cover_landscape = imagePathCoverLandscape;
      updateData.imageCoverLandscapeData = req.files.cover_landscape?.data;
    }
  }

  return [
    // Checks if there is a data update payload
    Object.keys(updateData).length !== 0,

    // Returns the data payload itself
    updateData,
  ];
};
