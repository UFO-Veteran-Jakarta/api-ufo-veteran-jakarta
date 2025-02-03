const pool = require('../config/database');

const {
  doUpdateQueryBySlug,
} = require('../utils/queryBuilder');

function createInsertQuery(data, tableName) {
  const fields = Object.keys(data);
  const values = Object.values(data);
  const placeholders = fields.map((_, index) => `$${index + 1}`);

  const query = `
    WITH inserted_article AS (
      INSERT INTO ${tableName} (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    )
    SELECT 
      articles.id AS article_id, 
      articles.slug, 
      articles.title,
      articles.author, 
      articles.cover, 
      articles.cover_landscape, 
      articles.snippets,
      articles.body,
      articles.created_at, 
      articles.updated_at, 
      articles.deleted_at,
      categories.id AS category_id, 
      categories.name AS category_name 
    FROM inserted_article AS articles
    JOIN categories ON articles.category_id = categories.id;
  `;

  return { query, values };
}

async function getPageBySlug(slug) {
  try {
    const res = await pool.query(
      'SELECT * FROM pages WHERE slug = $1',
      [slug],
    );
    return res.rows.length === 0 ? null : res.rows[0];
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    throw error;
  }
}

async function getPageSectionBySlug(slug) {
  try {
    const res = await pool.query(`
      SELECT
        p.id AS page_id,
        p.slug AS page_slug,
        p.title AS page_title,
        ps.section_key AS sections_section_key,
        ps.content AS sections_content,
        ps.created_at AS sections_created_at,
        ps.updated_at AS sections_updated_at
      FROM page_sections ps
      JOIN pages p ON ps.page_id = p.id
      WHERE p.slug = $1`,
      [slug],
    );
    return res.rows.length === 0 ? null : res.rows;
  } catch (error) {
    console.error('Error fetching page section by slug:', error);
    throw error;
  }
}

async function updatePageSectionBySlug(slug, section) {
  try {
    const res = await pool.query(`
      UPDATE page_sections ps
      SET content = $3, updated_at = NOW()
      FROM pages p
      WHERE ps.page_id = p.id
        AND ps.section_key = $2
        AND p.slug = $1
      RETURNING 
        p.id AS page_id,
        p.slug AS page_slug,
        p.title AS page_title,
        ps.section_key AS sections_section_key,
        ps.content AS sections_content,
        ps.created_at AS sections_created_at,
        ps.updated_at AS sections_updated_at;
      `,
      [slug, section.section_key, section.content],
    );
    
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating article with slug ${slug}:`, error);
    throw error;
  }
}

module.exports = {
  getPageBySlug,
  getPageSectionBySlug,
  updatePageSectionBySlug,
};