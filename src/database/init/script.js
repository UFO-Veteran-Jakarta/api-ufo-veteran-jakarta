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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS latest_activities(
      id SERIAL PRIMARY KEY,
      image text NOT NULL,
      title varchar(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS positions(
      id SERIAL PRIMARY KEY,
      name varchar(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS category_galleries(
      id SERIAL PRIMARY KEY,
      name varchar(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS galleries(
      id SERIAL PRIMARY KEY,
      slug varchar(255) NOT NULL,
      title varchar(255),
      category_galleries_id SERIAL,
      image varchar(255),
      snippet text,
      author varchar(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS members(
      id SERIAL PRIMARY KEY,
      division_id SERIAL,
      position_id SERIAL,
      name varchar(255) NOT NULL,
      image text NOT NULL,
      angkatan varchar(255),
      instagram varchar(255),
      linkedin varchar(255),
      whatsapp varchar(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages(
      id SERIAL PRIMARY KEY,
      slug text NOT NULL,
      title text NOT NULL,
      full_code text NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS page_sections(
      id SERIAL PRIMARY KEY,
      page_id SERIAL,
      section_key text,
      content text,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  await pool.query('DROP TABLE IF EXISTS category_galleries');
  await pool.query('DROP TABLE IF EXISTS galleries');
  await pool.query('DROP TABLE IF EXISTS members');
  await pool.query('DROP TABLE IF EXISTS pages');
  await pool.query('DROP TABLE IF EXISTS page_sections');
};