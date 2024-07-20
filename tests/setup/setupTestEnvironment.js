const pool = require("../../src/config/database");
const migrate = require("../../src/migration/users");

beforeAll(async () => {
  await migrate.createTable();

  //   const p = await pool.query("SELECT * FROM users");
  //   console.log(p.rows);
});

afterAll(async () => {
  await migrate.dropTable();
  await pool.end();
});
