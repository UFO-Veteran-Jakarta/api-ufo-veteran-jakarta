const pool = require('../config/database');

const constructInsertQuery = (data, tableName) => {
  const fields = [];
  const values = [];
  const placeholders = [];
  Object.keys(data).forEach((key, index) => {
    fields.push(key);
    values.push(data[key]);
    placeholders.push(`$${index + 1}`);
  });
  const query = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *;
  `;
  return { query, values };
};

const constructUpdateQuery = (data, tableName, id) => {
  const fields = [];
  const values = [];
  let index = 1;
  Object.keys(data).forEach((key) => {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index += 1;
  });
  const query = `
    UPDATE ${tableName}
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING *;
  `;
  return { query, values: [...values, id] };
};

const logError = (message, error) => {
  console.error(message, error);
};

exports.addAchievement = async (data) => {
  const { query, values } = constructInsertQuery(data, 'myschema.achievements');
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    logError('Error inserting achievement:', error);
    throw error;
  }
};

exports.getAllAchievements = async () => {
  const query = 'SELECT * FROM myschema.achievements WHERE deleted_at IS NULL';
  try {
    const res = await pool.query(query);
    return res.rows.length > 0 ? res.rows : null;
  } catch (error) {
    logError('Error fetching achievements:', error);
    throw error;
  }
};

exports.getAchievementById = async (id) => {
  try {
    const res = await pool.query(
      'SELECT * FROM myschema.achievements WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return res.rows.length === 0 ? null : res.rows[0];
  } catch (error) {
    logError(`Error fetching achievement with id ${id}:`, error);
    throw error;
  }
};

exports.updateAchievement = async (id, data) => {
  const { query, values } = constructUpdateQuery(
    data,
    'myschema.achievements',
    id,
  );
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    logError(`Error updating achievement with id ${id}:`, error);
    throw error;
  }
};

exports.deleteAchievementAll = async () => {
  const query = 'UPDATE myschema.achievements SET deleted_at = NOW()';
  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    logError('Error deleting all achievements:', error);
    throw error;
  }
};

exports.deleteAchievement = async (id) => {
  const query = `
    UPDATE myschema.achievements
    SET deleted_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;
  try {
    const res = await pool.query(query, [id]);
    return res.rows[0];
  } catch (error) {
    logError(`Error deleting achievement with id ${id}:`, error);
    throw error;
  }
};
