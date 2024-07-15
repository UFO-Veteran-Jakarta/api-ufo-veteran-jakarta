const pool = require("../../src/config/database");

beforeAll(async () => {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS example (id SERIAL PRIMARY KEY, data VARCHAR(100));"
  );
});

afterAll(async () => {
  await pool.query("DROP TABLE IF EXISTS example;");
  await pool.end();
});
