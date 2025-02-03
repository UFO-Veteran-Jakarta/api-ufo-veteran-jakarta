const express = require('express');
const userController = require('../controllers/userController');

const { authentication } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', /*authentication(),*/ userController.getAllUsers);

module.exports = router;