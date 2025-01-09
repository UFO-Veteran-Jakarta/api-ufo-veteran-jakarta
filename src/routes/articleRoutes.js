const express = require('express');
const {
  postArticleValidationRules,
  updateArticleValidationRules,
  validate,
} = require('../validators/articleValidator');
const { authentication } = require('../middlewares/authMiddleware');
const { checkFileArticle } = require('../middlewares/articleMiddlewareFile');
const articleController = require('../controllers/articleController');

const router = express.Router();

router.get(
  '/',
  articleController.getAllArticles,
);

router.get(
  '/:slug',
  articleController.getArticleBySlug,
);

router.post(
  '/',
  authentication(),
  postArticleValidationRules(),
  validate,
  checkFileArticle('cover'),
  checkFileArticle('cover_landscape'),
  articleController.addArticle,
);

router.patch(
  '/:slug',
  authentication(),
  checkFileArticle('cover', false, 'update'),
  checkFileArticle('cover_landscape', false, 'update'),
  updateArticleValidationRules(),
  validate,
  articleController.updateArticleBySlug,
);

router.delete(
  '/:slug',
  authentication(),
  articleController.deleteArticleBySlug,
);

module.exports = router;
