const {
  doInsertQuery,
  doSelectQuery,
  doUpdateQueryBySlug,
  doSoftDeleteQueryBySlug,
} = require('../utils/queryBuilder');
const pool = require('../config/database');

async function addGallery(data) {
  try {
    const res = await doInsertQuery(data, 'galleries');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting gallery:', error);
    throw error;
  }
}

async function getAllGalleries() {
  try {
    // const res = await doSelectQuery('galleries');
    const res = await pool.query(`
      SELECT g.*,
      cg.id as category_galleries_id,
      cg.name
      FROM galleries g
      JOIN category_galleries cg
      ON g.category_galleries_id = cg.id
    `);
    
    return res.rows.length > 0 ? res.rows : [];
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
}

async function getGalleryBySlug(slug, useCache = true) {
  try {
    const res = await doSelectQuery('galleries', [
      ['slug', '=', slug],
    ], useCache);

    return res.rows.length === 0 ? null : res.rows[0];
  } catch (error) {
    console.error('Error fetching galleries by slug:', error);
    throw error;
  }
}

async function updateGalleryBySlug(slug, data) {
  try {
    const res = await doUpdateQueryBySlug(data, 'galleries', slug);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating galleries with slug ${slug}:`, error);
    throw error;
  }
}

async function deleteAllGalleries() {
  try {
    const res = await doSoftDeleteQueryBySlug('galleries');
    return res.rows;
  } catch (error) {
    console.error('Error deleting all galleries:', error);
    throw error;
  }
}

async function deleteGalleryBySlug(slug) {
  try {
    const res = await doSoftDeleteQueryBySlug('galleries', slug);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting gallery with slug ${slug}:`, error);
    throw error;
  }
}

module.exports = {
  addGallery,
  getAllGalleries,
  getGalleryBySlug,
  updateGalleryBySlug,
  deleteAllGalleries,
  deleteGalleryBySlug,
};
