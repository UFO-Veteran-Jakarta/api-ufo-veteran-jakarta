const pool = require('../../../config/database');

exports.migrate = async () => {
  await pool.query(`
    ALTER TABLE divisions
    ADD COLUMN IF NOT EXISTS test_column varchar(50)
  `);

  // await pool.query(`
  //   DROP TABLE divisions
  // `);
};
