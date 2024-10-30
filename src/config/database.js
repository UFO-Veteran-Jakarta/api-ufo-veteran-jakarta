const { Pool } = require('pg');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
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

module.exports = pool;
