const { Pool } = require('pg');
require('dotenv').config({
  // Traces back to root directory (absolute path)
  path: `${__dirname}/../../${process.env.NODE_ENV === 'test' ? '.env.test' : '.env'}`,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL == 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', async (client) => {
  try {
    const searchPath = 'SET search_path TO ' + process.env.DATABASE_SCHEMA;
    await client.query(searchPath);
  } catch (error) {
    console.error('Error setting search path:', error);
  }
});

// Run a single query inside a transaction. Retries if failed
pool.runTransaction = async (query, values = [], retries = 3, delay = 1000) => {
  // Get a connection from the pool
  const client = await pool.connect();

  /* eslint-disable no-await-in-loop */
  // Retry loop
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      // Start a new transaction
      await client.query('BEGIN');

      let result;

      // Check if values are provided (i.e., non-empty array), then execute query
      if (values.length > 0) {
        // Run query with values
        result = await client.query(query, values);
      } else {
        // Run query without values
        result = await client.query(query);
      }

      // Commit the transaction if everything succeeded
      await client.query('COMMIT');

      // Return the query result
      return result;
    } catch (error) {
      // Rollback the transaction if any query failed
      await client.query('ROLLBACK');

      // Log the error
      console.error(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt === retries) {
        // If we've reached the maximum number of retries, propagate the error
        throw new Error(`Transaction failed after ${retries} attempts: ${error.message}`);
      } else {
        // Wait before retrying
        console.log(`Retrying in ${delay}ms...`);
        // Wait for `delay` ms before retrying
        /* eslint-disable no-promise-executor-return */
        await new Promise((resolve) => setTimeout(resolve, delay));
        /* eslint-enable no-promise-executor-return */
      }
    } finally {
      // Release the connection back to the pool
      client.release();
    }
  }
  /* eslint-enable no-await-in-loop */
};

module.exports = pool;