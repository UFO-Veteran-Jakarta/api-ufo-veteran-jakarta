const pool = require("../../config/database");

exports.seed = async () => {
  await pool.query(`
    INSERT INTO users (username, password, created_at, updated_at, deleted_at)
    VALUES ('john_doe', 'securepassword123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
  `);
};
