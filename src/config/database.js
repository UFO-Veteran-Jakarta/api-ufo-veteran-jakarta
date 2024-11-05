const { Pool } = require('pg');
require('dotenv').config({
  // Traces back to root directory (absolute path)
  path: __dirname + '/../../' + ( process.env.NODE_ENV === 'test' ? '.env.test' : '.env' ),
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', async (client) => {
  try {
    const schema = process.env.DB_SCHEMA || 'myschema';
    await client.query(`SET search_path TO ${schema}`);
  } catch (error) {
    console.error("Error setting search path:", error);
  }
});

// Run a single query inside a transaction. Retries if failed
const runTransaction = async (query, values = [], retries = 3, delay = 1000) => {
  const client = await pool.connect(); // Get a connection from the pool

  // Retry loop
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await client.query('BEGIN'); // Start a new transaction

      let result;

      // Check if values are provided (i.e., non-empty array), then execute query
      if (values.length > 0) {
        result = await client.query(query, values); // Run query with values
      } else {
        result = await client.query(query); // Run query without values
      }

      await client.query('COMMIT'); // Commit the transaction if everything succeeded
      return result; // Return the query result
    } catch (error) {
      await client.query('ROLLBACK'); // Rollback the transaction if any query failed

      // Log the error
      console.error(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt === retries) {
        // If we've reached the maximum number of retries, propagate the error
        throw new Error(`Transaction failed after ${retries} attempts: ${error.message}`);
      } else {
        // Wait before retrying
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay)); // Wait for `delay` ms before retrying
      }
    } finally {
      client.release(); // Release the connection back to the pool
    }
  }
};

module.exports = {
  pool,
  runTransaction,
};
