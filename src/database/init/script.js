const pool = require('../../config/database');

exports.createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contents (
      id SERIAL PRIMARY KEY,
      link VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
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
    CREATE TABLE IF NOT EXISTS partners (
      id SERIAL PRIMARY KEY,
      name varchar(255) NOT NULL,
      logo text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS achievements (
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
    CREATE TABLE IF NOT EXISTS work_programs (
      id SERIAL PRIMARY KEY,
      image text NOT NULL,
      title varchar(255) NOT NULL,
      description text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS latest_activities(
      id SERIAL PRIMARY KEY,
      image text NOT NULL,
      title varchar(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS divisions(
      id SERIAL PRIMARY KEY,
      slug text NOT NULL, 
      name varchar(255) NOT NULL,
      image text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS positions(
      id SERIAL PRIMARY KEY,
      name varchar(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
};

exports.dropTable = async () => {
  await pool.query('DROP TABLE IF EXISTS users');
  await pool.query('DROP TABLE IF EXISTS contents');
  await pool.query('DROP TABLE IF EXISTS events');
  await pool.query('DROP TABLE IF EXISTS partners');
  await pool.query('DROP TABLE IF EXISTS achievements');
  await pool.query('DROP TABLE IF EXISTS work_programs');
  await pool.query('DROP TABLE IF EXISTS latest_activities');
  await pool.query('DROP TABLE IF EXISTS divisions');
  await pool.query('DROP TABLE IF EXISTS positions');
};
