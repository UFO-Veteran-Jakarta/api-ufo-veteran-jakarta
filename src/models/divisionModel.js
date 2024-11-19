const {
  doInsertQuery,
  doSelectQuery,
  doUpdateQueryBySlug,
  doSoftDeleteQueryBySlug,
} = require('../utils/queryBuilder');

async function addDivision(data) {
  try {
    const res = await doInsertQuery(data, 'divisions');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting division:', error);
    throw error;
  }
}

async function getAllDivisions() {
  try {
    const res = await doSelectQuery('divisions');
    return res.rows.length > 0 ? res.rows : [];
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error;
  }
}

async function getDivisionBySlug(slug, useCache = true) {
  try {
    const res = await doSelectQuery('divisions', [
      ['slug', '=', slug],
    ], useCache);

    return res.rows.length === 0 ? null : res.rows[0];
  } catch (error) {
    console.error('Error fetching division by slug:', error);
    throw error;
  }
}

async function updateDivisionBySlug(slug, data) {
  try {
    const res = await doUpdateQueryBySlug(data, 'divisions', slug);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating division with slug ${slug}:`, error);
    throw error;
  }
}

async function deleteAllDivisions() {
  try {
    const res = await doSoftDeleteQueryBySlug('divisions');
    return res.rows;
  } catch (error) {
    console.error('Error deleting all divisions:', error);
    throw error;
  }
}

async function deleteDivisionBySlug(slug) {
  try {
    const res = await doSoftDeleteQueryBySlug('divisions', slug);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting division with slug ${slug}:`, error);
    throw error;
  }
}

module.exports = {
  addDivision,
  getAllDivisions,
  getDivisionBySlug,
  updateDivisionBySlug,
  deleteAllDivisions,
  deleteDivisionBySlug,
};
