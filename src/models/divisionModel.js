const pool = require('../config/database');

function createInsertQuery(data, tableName) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES(${placeholders.join(', ')})
    RETURNING *;
    `;

  return { query, values };
}

function createUpdateQuery(data, tableName, slug) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  const query = `
        UPDATE ${tableName}
        SET ${setClause}, updated_at = NOW()
        WHERE slug = $${fields.length + 1}
        RETURNING *;
    `;

  return { query, values: [...values, slug] };
}

async function addDivision(data) {
  const { query, values } = createInsertQuery(data, 'myschema.divisions');

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting division:', error);
    throw error;
  }
}

async function getAllDivisions() {
  const query = `
    SELECT * FROM myschema.divisions WHERE deleted_at IS NULL;
  `;

  try {
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows : [];
  } catch (error) {
    console.error('Error fetching divisions:', error);
    throw error; 
  }
}


async function getDivisionBySlug(slug) {
  const query = `
        SELECT * FROM myschema.divisions WHERE slug = $1 AND deleted_at IS NULL
    `;

  try {
    const res = await pool.query(query, [slug]);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (error) {
    console.error('Error fetching division by slug:', error);
    throw error;
  }
}

async function updateDivisionBySlug(slug, data) {
  const { query, values } = createUpdateQuery(data, 'myschema.divisions', slug);

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating division with slug ${slug}:`, error);
    throw error;
  }
}

async function deleteAllDivisions() {
  const query = 'UPDATE myschema.divisions SET deleted_at = NOW()';

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error deleting all divisions:', error);
    throw error;
  }
}

async function deleteDivisionBySlug(slug) {
  const query = `
        UPDATE myschema.divisions SET deleted_at = NOW() WHERE slug = $1 RETURNING *;
    `;

  try {
    const res = await pool.query(query, [slug]);
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
