const pool = require("../config/database");

exports.createUser = async () => {
  await pool.query(`INSERT INTO myschema.users (username, password, created_at, updated_at, deleted_at)
      VALUES ('john_doe', 'securepassword123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);`);
};
exports.deleteUser = async () => {
  await pool.query(`DELETE FROM myschema.users`);
};

exports.createTable = async () => {
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
  await pool.query(`
      CREATE TABLE IF NOT EXISTS myschema.contents (
        id SERIAL PRIMARY KEY,
        link VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

  await pool.query(`
      CREATE TABLE IF NOT EXISTS myschema.events (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) NOT NULL,
        cover VARCHAR(255),
        cover_landscape VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        start_event_date DATE NOT NULL,
        end_event_date DATE NOT NULL,
        start_event_time TIME NOT NULL,
        end_event_time TIME NOT NULL,
        registration_start_date DATE,
        registration_end_date DATE,
        registration_start_time TIME,
        registration_end_time TIME,
        body TEXT NOT NULL,
        snippets TEXT,
        link_registration TEXT,
        location VARCHAR(255) NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      )
    `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS myschema.partners (
      id SERIAL PRIMARY KEY,
      name varchar(255) NOT NULL,
      logo text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP ,
      deleted_at TIMESTAMP
    )
    `);
};
exports.dropTable = async () => {
  await pool.query(`DROP TABLE IF EXISTS myschema.users;`);
  await pool.query(`DROP TABLE IF EXISTS myschema.contents;`);
  await pool.query(`DROP TABLE IF EXISTS myschema.events;`);
};
