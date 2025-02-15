const pool = require('../config/database');

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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS myschema.achievements (
      id SERIAL PRIMARY KEY,
      logo text NOT NULL,
      name varchar(255) NOT NULL,
      year varchar(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
    `);

  await pool.query(`
  CREATE TABLE IF NOT EXISTS myschema.work_programs (
    id SERIAL PRIMARY KEY,
    image text NOT NULL,
    title varchar(255) NOT NULL,
    description text NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP ,
    deleted_at TIMESTAMP
  )
  `);

  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS myschema.latest_activities(
      id SERIAL PRIMARY KEY,
      image text NOT NULL,
      title varchar(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP ,
      deleted_at TIMESTAMP
    )
    `,
  );

  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS myschema.divisions(
      id SERIAL PRIMARY KEY,
      slug text NOT NULL, 
      name varchar(255) NOT NULL,
      image text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP ,
      deleted_at TIMESTAMP
    )
    `,
  );

  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS myschema.positions(
      id SERIAL PRIMARY KEY,
      name varchar(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP ,
      deleted_at TIMESTAMP
    )
    `,
  );
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS myschema.members(
      id SERIAL PRIMARY KEY,
      division_id INT NOT NULL,
      position_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      image TEXT NOT NULL,
      angkatan VARCHAR(255),
      instagram VARCHAR(255),
      linkedin VARCHAR(255),
      whatsapp VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `,
  );
  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS myschema.categories(
      id SERIAL PRIMARY KEY,
      name varchar(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP ,
      deleted_at TIMESTAMP
    )
    `,
  );

  await pool.query(
    `
    CREATE TABLE IF NOT EXISTS articles(
      id serial PRIMARY KEY,
      category_id int NOT NULL,
      slug varchar(255) NOT NULL UNIQUE,
      title varchar(255) NOT NULL,
      author varchar(255) NOT NULL,
      cover varchar(255),
      cover_landscape varchar(255),
      snippets text,
      body text NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
      deleted_at timestamp,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
    `,
  );
};

exports.dropTable = async () => {
  await pool.query('DROP TABLE IF EXISTS myschema.users;');
  await pool.query('DROP TABLE IF EXISTS myschema.contents;');
  await pool.query('DROP TABLE IF EXISTS myschema.events;');
  await pool.query('DROP TABLE IF EXISTS myschema.partners;');
  await pool.query('DROP TABLE IF EXISTS myschema.achievements;');
  await pool.query('DROP TABLE IF EXISTS myschema.work_programs;');
  await pool.query('DROP TABLE IF EXISTS myschema.latest_activities;');
  await pool.query('DROP TABLE IF EXISTS myschema.divisions;');
  await pool.query('DROP TABLE IF EXISTS myschema.positions;');
  await pool.query('DROP TABLE IF EXISTS myschema.members;');
  await pool.query('DROP TABLE IF EXISTS myschema.categories');
  await pool.query('DROP TABLE IF EXISTS articles');
};
