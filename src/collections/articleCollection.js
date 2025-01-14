const articleService = require('../services/articleService');

const formatArticle = (article) => {
  return {
    slug: article.slug,
    title: article.title,
    category: {
      id: article.category_id,
      name: article.category_name,
    },
    author: article.author,
    cover: article.cover,
    cover_landscape: article.cover_landscape,
    snippet: article.snippets,
    body: article.body,
    created_at: article.created_at,
    updated_at: article.updated_at,
    deleted_at: article.deleted_at,
  };
};

const getFormattedArticles = async () => {
  const articles = await articleService.getAllArticles();
  return articles.map(formatArticle);
};

const getFormattedArticle = async (slug, useCache = true) => {
  const article = await articleService.getArticleBySlug(slug, useCache);
  return formatArticle(article);
};

const addFormattedArticle = async (data) => {
  const newArticle = await articleService.addArticle(data);
  return formatArticle(newArticle);
};

const updateFormattedArticle = async (slug, data) => {
  const updatedArticle = await articleService.updateArticleBySlug(slug, data);
  return formatArticle(updatedArticle);
};

module.exports = {
  getFormattedArticles,
  getFormattedArticle,
  addFormattedArticle,
  updateFormattedArticle,
  formatArticle,
};
