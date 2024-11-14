const express = require('express');
const categoriesController = require('../controllers/categoriesController');

const {
    postValidationRules,
    updateValidationRules,
    validate,
} = require('../validators/categoriesValidator');
const { authentication } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
    '/',
    authentication(),
    postValidationRules(),
    validate,
    categoriesController.addCategories,
);

router.get('/', categoriesController.getAllCategories);

router.get(
    '/:id',
    categoriesController.getCategoriesById,
);

router.patch(
    '/:id',
    authentication(),
    updateValidationRules(),
    validate,
    categoriesController.updateCategoriesById,
);

router.delete(
    '/:id', 
    authentication(), 
    categoriesController.deleteCategories,
);

router.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Unauthorized');
    } else {
        next(err);
    }
});

module.exports = router;