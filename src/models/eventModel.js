const pool = require('../config/database');

exports.addEvent = async function insertEvent(data) {
  const fields = [];
  const values = [];
  const placeholders = [];

  Object.keys(data).forEach((key, index) => {
    fields.push(key);
    values.push(data[key]);
    placeholders.push(`$${index + 1}`);
  });

  const query = `
    INSERT INTO events (${fields.join(', ')})
    VALUES (${placeholders.join(', ')})
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error inserting event:', err);
  }
};

exports.getAllEvents = async function getAllEvents() {
  const query = 'SELECT * FROM events';

  try {
    const res = await pool.query(query);
    return res.rows;
  } catch (err) {
    console.error('Error fetching events:', err);
    throw err;
  }
};

exports.getEventBySlug = async function getEventBySlug(slug) {
  const query = 'SELECT * FROM events WHERE slug = $1';

  try {
    const res = await pool.query(query, [slug]);
    return res.rows[0];
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    throw error;
  }
};

exports.updateEventInDb = async (slug, data) => {
  const fields = [];
  const values = [];
  let index = 1;

  Object.keys(data).forEach((key) => {
    fields.push(`${key} = $${index}`);
    values.push(data[key]);
    index += 1;
  });

  const query = `
    UPDATE events
    SET ${fields.join(', ')}, updated_at = NOW()
    WHERE slug = $${index}
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [...values, slug]);
    return res.rows[0];
  } catch (err) {
    console.error(`Error updating event with slug ${slug}:`, err);
    throw err;
  }
};

exports.softDeleteEventBySlug = async function softDeleteEventBySlug(slug) {
  const query = `
    UPDATE events
    SET deleted_at = NOW()
    WHERE slug = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(query, [slug]);
    return res.rows[0];
  } catch (error) {
    console.error('Error soft deleting event by slug:', error);
    throw error;
  }
};
