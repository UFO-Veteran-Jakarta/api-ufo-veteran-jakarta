const pool = require('../config/database');

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