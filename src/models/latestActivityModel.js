const pool = require('../config/database');

function createInsertQuery(data, tableName) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
        INSERT INTO ${tableName} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *;
    `;

  return { query, values };
}

function createUpdateQuery(data, tableName, id) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  const query = `
        UPDATE ${tableName}
        SET ${setClause}, updated_at  = NOW()
        WHERE id = $${fields.length + 1}
        RETURNING *;
    `;

  return { query, values: [...values, id] };
}

async function addLatestActivity(data) {
  const { query, values } = createInsertQuery(
    data,
    'myschema.latest_activities',
  );

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting latest activity:', error);
  }
}

async function getAllLatestActivities() {
  const query =
    'SELECT * FROM myschema.latest_activities WHERE deleted_at IS NULL';

  try {
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows : null;
  } catch (error) {
    console.error('Error fetching latest activities:', error);
  }
}

async function getLatestActivityById(id) {
  const query = `
    SELECT * FROM myschema.latest_activities
    WHERE id = $1 AND deleted_at IS NULL`;

  try {
    const res = await pool.query(query, [id]);

    if (res.rows.length === 0) {
      return null;
    }

    return res.rows[0];
  } catch (error) {
    console.error(`Error fetching latest activity with id ${id}:`, error);
    return null;
  }
}

async function updateLatestActivity(id, data) {
  const { query, values } = createUpdateQuery(
    data,
    'myschema.latest_activities',
    id,
  );

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating latest activity with id ${id}:`, error);

    throw error;
  }
}

async function deleteAllLatestActivities() {
  const query = 'UPDATE myschema.latest_activities SET deleted_at = NOW()';

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error('Error deleting all latest activities:', error);
    throw error;
  }
}

async function deleteLatestActivity(id) {
  const query = `
    UPDATE myschema.latest_activities 
    SET deleted_at = NOW() 
    WHERE id = $1 
    RETURNING *;
    `;

  try {
    const res = await pool.query(query, [id]);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting latest activity with id ${id}:`, error);
    throw error;
  }
}

module.exports = {
  addLatestActivity,
  getAllLatestActivities,
  getLatestActivityById,
  updateLatestActivity,
  deleteAllLatestActivities,
  deleteLatestActivity,
};
