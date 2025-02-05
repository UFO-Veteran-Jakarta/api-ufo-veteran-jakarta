const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');
const { createSlugDivision } = require('../helpers/slug');
const { uploadFileArticle } = require('../utils/uploadFileArticle');
const {
  addFormattedArticle,
  getFormattedArticles,
  formatArticle,
} = require('../collections/articleCollection');
const { buildResponse } = require('../utils/buildResponseArticle');

const {
  stageDataUpdateArticleBySlug,
  updateArticleBySlug,
  deleteArticleBySlug,
  checkSlugExistsInDb,
  getArticleBySlug,
} = require('../services/articleService');

const {
  getCategoriesById,
} = require('../services/categoriesService');

exports.addArticle = async (req, res) => {
  try {
    req.body.slug = await createSlugDivision(
      req.body.title,
      checkSlugExistsInDb,
    );

    const categoryById = await getCategoriesById(req.body.category_id);

    if (!categoryById) {
      return sendResponse(res, 404, 'category article not found');
    }

    // Gatau mau diapain tanya haikal
    if (req.files?.cover) {
      const imagePath = await uploadFileArticle(req.files.cover, 'cover', 'articles');
      if (imagePath) {
        req.body.cover = imagePath;
      }
    }
    // tanya haikal 2
    if (req.files?.cover_landscape) {
      const imagePath = await uploadFileArticle(req.files.cover_landscape, 'cover_landscape', 'articles');
      if (imagePath) {
        req.body.cover_landscape = imagePath;
      }
    }

    // Menambahkan member dan memformat responsnya
    const formattedArticle = await addFormattedArticle(req.body);

    logger.info('Add Success: Successfully added a new article');
    return sendResponse(res, 200, 'Successfully added a new article', formattedArticle);
  } catch (error) {
    logger.error('Add Error: Failed to add a new article', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.getAllArticles = async (req, res) => {
  try {
    const articles = await getFormattedArticles();

    if (articles.length === 0) {
      logger.info('No articles available.');
      return sendResponse(res, 204, 'No articles available.', []);
    }

    logger.info('Successfully retrieved articles');
    return sendResponse(
      res,
      200,
      'Successfully retrieved articles',
      articles,
    );
  } catch (error) {
    logger.error('Failed to retrieve articles:', error);
    return sendResponse(res, 500, 'Failed to retrieve articles.', []);
  }
};

exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const formattedArticle = await getArticleBySlug(slug);

    if (!formattedArticle) {
      logger.error('Article not found');
      return sendResponse(res, 404, 'Article not found');
    }

    const article = formatArticle(formattedArticle);

    logger.info(`Successfully retrieved article by slug '${slug}'`);
    return sendResponse(
      res,
      200,
      'Successfully retrieved article by slug',
      article,
    );
  } catch (error) {
    logger.error('Failed to retrieve article by slug', error);
    return sendResponse(res, 500, error.message);
  }
};

exports.updateArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const oldMemberData = await getArticleBySlug(slug);

    if (!oldMemberData) {
      return sendResponse(res, 404, 'Article not found');
    }

    const [isUpdateData, updateData] = await stageDataUpdateArticleBySlug(req);
    if (!isUpdateData) {
      return sendResponse(res, 400, 'Missing required fields');
    }

    const updatedArticle = await updateArticleBySlug(slug, oldMemberData, updateData);

    const [responseMessage, responseData] = await buildResponse(
      oldMemberData,
      updateData,
      updatedArticle,
    );

    return sendResponse(res, 200, responseMessage, responseData);
  } catch (error) {
    console.error('Failed to update an article:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};

exports.deleteArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const articleBySlug = await getArticleBySlug(slug);

    if (!articleBySlug) {
      return sendResponse(res, 404, 'Article not found');
    }

    const result = await deleteArticleBySlug(slug);

    return sendResponse(res, 200, 'Successfully deleted article', result);
  } catch (error) {
    console.error('Failed to delete an article:', error);
    return sendResponse(res, 500, 'Internal server error');
  }
};
