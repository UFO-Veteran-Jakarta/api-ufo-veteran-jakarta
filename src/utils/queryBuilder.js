const pool = require('../config/database');

/**
 *
 * SQL Query Builder for CRUD Operations.
 */

const queryCache = {};
const CACHE_TTL = 10_000; // 10 seconds cache expiration

/**
 * Create a cache key from the query and values.
 * @param {string} query - The SQL query string.
 * @param {Array} values - The parameters to be used in the query.
 * @returns {string} - The cache key.
 */
function generateCacheKey(query, values) {
  return query + JSON.stringify(values);
}

/**
 * Query generator for INSERT
 * 
 */
const generateInsertQuery = (data, tableName) => {
  const fields = Object.keys(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
    INSERT INTO ${tableName} (${fields.join(', ')})
    VALUES(${placeholders.join(', ')})
    RETURNING *
  `;

  return query;
};

/**
 * Query builder for INSERT
 *
 * @param {*} data
 * @param {*} tableName
 * @returns
 */
const doInsertQuery = async (data, tableName) => {
  const values = Object.values(data);

  const query = generateInsertQuery(data, tableName);

  // Query logging
  console.log(query);

  const result = await pool.runTransaction(query, values);
  return result;
};

/**
 * Query builder for SELECT with automatic query caching.
 * This function will first check if the query result is in cache,
 * and if not, it will execute the query on the database and cache the result.
 *
 * @param {Array} comparator - An array of conditions, where each condition is
 *                             an array like ['column', operator, value']
 * @param {string} tableName - The name of the table to query from
 * @returns {Promise<Array>} - Returns the rows from the cached result or from
 *                             the database
 */
const doSelectQuery = async (tableName, comparator = [], useCache = true) => {
  if (typeof tableName !== 'string' || tableName.trim() === '') {
    throw new Error('Table name must be a non-empty string');
  }

  const whereConditions = [];
  const values = [];

  // If comparator is empty, then it doesn't have WHERE comparators
  if (Array.isArray(comparator) && comparator.length !== 0) {
    comparator.forEach((condition, index) => {
      if (condition.length !== 3) {
        throw new Error(
          'Each condition should be an array with 3 elements ' +
            `[column, operator, value], but received: ${JSON.stringify(
              condition,
            )}`,
        );
      }

      const [column, operator, value] = condition;
      whereConditions.push(`${column} ${operator} $${index + 1}`);
      values.push(value);
    });
  }

  const whereClause = `WHERE ${
    whereConditions.length ? `${whereConditions.join(' AND ')} AND ` : ''
  }deleted_at IS NULL`;
  const query = `SELECT * FROM ${tableName} ${whereClause};`;

  // Query logging
  console.log(query);

  let cacheKey = '';
  if (useCache) {
    // Generate the cache key for this query
    cacheKey = generateCacheKey(query, values);

    // Check if the query result is cached and is still valid
    const cached = queryCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached data for query: ', cacheKey);
      return { rows: cached.data }; // Return cached result
    }
  }

  // Otherwise, execute the query on the database
  const result = await pool.query(query, values);

  if (useCache) {
    // Cache the result for future use
    queryCache[cacheKey] = {
      data: result.rows,
      timestamp: Date.now(), // Store the current timestamp for cache expiration
    };
  }

  return result; // Return the fresh query result
};

/**
 * Query builder for UPDATE by slug
 *
 * @param {*} data
 * @param {*} tableName
 * @param {*} slug
 * @returns
 */
const doUpdateQueryBySlug = async (data, tableName, slug) => {
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

  // Query logging
  console.log(query);

  const result = await pool.runTransaction(query, [...values, slug]);
  return result;
};

/**
 * Query builder for UPDATE by ID
 *
 * @param {Object} data - The data to update
 * @param {string} tableName - The name of the table
 * @param {number|string} id - The ID of the record to update
 * @returns {Promise<Object>} - Returns the updated record
 */
const doUpdateQueryById = async (data, tableName, id) => {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields
    .map((field, index) => `${field} = $${index + 1}`)
    .join(', ');

  const query = `
      UPDATE ${tableName}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${fields.length + 1}
      RETURNING *;
  `;

  // Query logging
  console.log(query);

  const result = await pool.runTransaction(query, [...values, id]);
  return result;
};

/**
 * Query builder for DELETE (soft delete) by slug
 *
 * @param {*} tableName
 * @param {*} slug
 * @returns
 */
const doSoftDeleteQueryBySlug = async (tableName, slug = '') => {
  let query = `
    UPDATE ${tableName} SET deleted_at = NOW() 
  `;

  if (slug) {
    query += ' WHERE SLUG = $1 ';
  }

  query += ' RETURNING *;';

  // Query logging
  console.log(query);

  const result = slug
    ? await pool.runTransaction(query, [slug])
    : await pool.runTransaction(query);

  return result;
};

const doSoftDeleteQueryById = async (tableName, id = '') => {
  let query = `
    UPDATE ${tableName} SET deleted_at = NOW() 
  `;

  if (id) {
    query += ' WHERE ID = $1 ';
  }

  query += ' RETURNING *;';

  // Query logging
  console.log(query);

  const result = id
    ? await pool.runTransaction(query, [id])
    : await pool.runTransaction(query);

  return result;
};

const executeQuery = async function (query, values) {
  try {
    const res = await pool.query(query, values);
    return res.rows.length > 0 ? res.rows[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }

module.exports = {
  generateInsertQuery,
  doInsertQuery,
  doSelectQuery,
  doUpdateQueryBySlug,
  doUpdateQueryById,
  doSoftDeleteQueryBySlug,
  doSoftDeleteQueryById,
  executeQuery,
};
