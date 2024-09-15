const pool = require('../../src/config/database');
const migrate = require('../../src/migration/users');

beforeAll(async () => {
  await migrate.createTable();
});

afterAll(async () => {
  await migrate.dropTable();
  await pool.end();
});
