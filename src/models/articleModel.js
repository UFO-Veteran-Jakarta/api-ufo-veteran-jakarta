const pool = require('../config/database');

const {
  doUpdateQueryBySlug,
  doSoftDeleteQueryBySlug,
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

const getAllArticlesQuery = `
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
  FROM articles
  JOIN categories ON articles.category_id = categories.id
  WHERE articles.deleted_at IS NULL;
`;

const getArticleBySlugQuery = `
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
  FROM articles
  JOIN categories ON articles.category_id = categories.id
  WHERE slug = $1 AND articles.deleted_at IS NULL;
`;

async function addArticle(data) {
  const { query, values } = createInsertQuery(data, 'articles');
  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (error) {
    console.error('Error inserting article:', error);
    throw error;
  }
}

async function getAllArticles() {
  try {
    const res = await pool.query(getAllArticlesQuery);
    return res.rows.length > 0 ? res.rows : [];
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
}

async function getArticleBySlug(slug) {
  try {
    const res = await pool.query(getArticleBySlugQuery, [slug]);
    return res.rows.length === 0 ? null : res.rows[0];
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    throw error;
  }
}

async function updateArticleBySlug(slug, data) {
  try {
    const res = await doUpdateQueryBySlug(data, 'articles', slug);
    return res.rows[0];
  } catch (error) {
    console.error(`Error updating article with slug ${slug}:`, error);
    throw error;
  }
}

async function deleteAllArticles() {
  try {
    const res = await doSoftDeleteQueryBySlug('articles');
    return res.rows;
  } catch (error) {
    console.error('Error deleting all articles:', error);
    throw error;
  }
}

async function deleteArticleBySlug(slug) {
  try {
    const res = await doSoftDeleteQueryBySlug('articles', slug);
    return res.rows[0];
  } catch (error) {
    console.error(`Error deleting article with slug ${slug}:`, error);
    throw error;
  }
}

module.exports = {
  addArticle,
  getAllArticles,
  getArticleBySlug,
  updateArticleBySlug,
  deleteAllArticles,
  deleteArticleBySlug,
};
