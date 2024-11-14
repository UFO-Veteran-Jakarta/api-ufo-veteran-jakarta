const pool = require('../config/database');
const { doInsertQuery, doUpdateQueryById } = require('../utils/queryBuilder');

async function executeQuery(query, values) {
  try {
    const res = await pool.query(query, values);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

exports.addCategories = async (data) => {
  try {
    const res = await doInsertQuery(data, 'categories');
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting category:', error);
    throw error;
  }
};

exports.getAllCategories = async () => {
  const query = 'SELECT * FROM myschema.categories WHERE deleted_at IS NULL;';
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

exports.getCategoriesById = async (id) => {
  const query =
  'SELECT * FROM myschema.categories WHERE id = $1 AND deleted_at IS NULL;';
  const values = [id];
  return executeQuery(query, values);
};

exports.deleteAllCategories = async () => {
  const query = 'UPDATE myschema.categories SET deleted_at = NOW()';
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error deleting all categories:', error);
    throw error;
  }
};

exports.updateCategoriesById = async (id, data) => {
  try {
    const res = await doUpdateQueryById(data, 'categories', id);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating category with id ${id}:`, error);
    throw error;
  }
};

exports.deleteCategoriesById = async (id) => {
  const query =
    'UPDATE myschema.categories SET deleted_at = NOW() WHERE id = $1 RETURNING *;';
  const values = [id];
  return executeQuery(query, values);
};
