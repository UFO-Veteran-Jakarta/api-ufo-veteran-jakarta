const {
    addCategories,
    getAllCategories,
    getCategoriesById,
    updateCategoriesById,
    deleteCategoriesById,
} = require('../services/categoriesService');
const logger = require('../utils/logger');
const { sendResponse } = require('../helpers/response');

exports.addCategories = async (req, res) => {
    try {
        const newCategory = await addCategories(req.body);
        logger.info('Add Success: Success Add Category');
        return sendResponse(res, 201, 'Successfully insert category articles data', newCategory);
    } catch (error) {
        logger.error('Add Error: Failed Add Position', error);
        return sendResponse(res, 500, error.message);
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const allCategories = await getAllCategories();

        if (allCategories.length === 0) {
            logger.info('No category articles data are available.');
            return sendResponse(res, 204, 'No category articles data are available.', []);
        }

        logger.info('Get Success: Success Get Category Articles');
        return sendResponse(res, 200, 'Successfully retrieved all category articles data', allCategories,
        );
    } catch (error) {
        logger.error('Failed to retrieved category articles data.');
        return sendResponse(res, 500, error.message);
    }
};

exports.updateCategoriesById = async (req, res) => {
    try {
        const { id } = req.params;

        const categoryById = await getCategoriesById(id);
        if (!categoryById) {
            return sendResponse(res, 404, 'Category Article Not Found');
        }

        const updatedCategory = await updateCategoriesById(id, req.body);
        logger.info('Update Success: Successfully update category articles name');
        return sendResponse(res, 201, 'Successfully update category articles name', updatedCategory,);
    } catch (error) {
        logger.error('Update Error: Failed to update category article name');
        return sendResponse(res, 500, error.message);
    }
};

exports.getCategoriesById = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryById = await getCategoriesById(id);

        if (!categoryById) {
            return sendResponse(res, 404, 'category article not found');
        }

        logger.info('Get Success: Success Get Category Article');
        return sendResponse(res, 200, 'Successfully retrieved category articles data', categoryById);
        } catch (error) {
            logger.error('Get Error: Failed Get Category Article');
            return sendResponse(res, 500, error.message);
        }
};

exports.deleteCategories = async (req, res) => {
    try {
        const { id } = req.params;
        const categoryById = await getCategoriesById(id);
    
        if (!categoryById) {
            logger.error('category article not found.');
            return sendResponse(res, 404, 'category article not found.');
        }
    
        const deletedCategory = await deleteCategoriesById(id);
    
        logger.info(`Successfully deleted category article with ID ${id}`);
        return sendResponse(res, 200, 'Successfully delete category article data', deletedCategory);
    } catch (error) {
        logger.error('Failed to delete category article');
        return sendResponse(res, 500, error.message);
    }
};