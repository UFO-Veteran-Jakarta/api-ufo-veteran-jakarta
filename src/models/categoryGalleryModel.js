const {
  doInsertQuery,
  doSelectQuery,
  doUpdateQueryById,
  doSoftDeleteQueryById,
} = require('../utils/queryBuilder');

async function addCategoryGallery(data) {
  try {
    const res = await doInsertQuery(data, 'galleries');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting category gallery:', error);
    throw error;
  }
}

async function getAllCategoryGalleries() {
  try {
    const res = await doSelectQuery('category_galleries');
    return res.rows.length > 0 ? res.rows : [];
  } catch (error) {
    console.error('Error fetching category galleries:', error);
    throw error;
  }
}

async function getCategoryGalleryById(id, useCache = true) {
  try {
    const res = await doSelectQuery('category_galleries', [
      ['id', '=', id],
    ], useCache);

    return res.rows.length === 0 ? null : res.rows[0];
  } catch (error) {
    console.error('Error fetching category galleries by id:', error);
    throw error;
  }
}

async function updateCategoryGalleryById(id, data) {
  try {
    const res = await doUpdateQueryById(data, 'category_galleries', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating category galleries with id ${id}:`, error);
    throw error;
  }
}

async function deleteAllCategoryGalleries() {
  try {
    const res = await doSoftDeleteQueryById('category_galleries');
    return res.rows;
  } catch (error) {
    console.error('Error deleting all category galleries:', error);
    throw error;
  }
}

async function deleteCategoryGalleryById(id) {
  try {
    const res = await doSoftDeleteQueryById('category_galleries', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting category gallery with id ${id}:`, error);
    throw error;
  }
}

module.exports = {
  addCategoryGallery,
  getAllCategoryGalleries,
  getCategoryGalleryById,
  updateCategoryGalleryById,
  deleteAllCategoryGalleries,
  deleteCategoryGalleryById,
};
