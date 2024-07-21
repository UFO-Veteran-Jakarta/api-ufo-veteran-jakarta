const pool = require("../config/database");

exports.createUser = async () => {
  await pool.query(`INSERT INTO users (username, password, created_at, updated_at, deleted_at)
      VALUES ('john_doe', 'securepassword123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);`);
};
exports.deleteUser = async () => {
  await pool.query(`DELETE FROM users`);
};

exports.createTable = async () => {
  //   await pool.query(`DROP TABLE users;`);

  await pool.query(`
      CREATE TABLE IF NOT EXISTS myschema.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);
};
exports.dropTable = async () => {
  await pool.query(`DROP TABLE IF EXISTS myschema.users;`);
};
