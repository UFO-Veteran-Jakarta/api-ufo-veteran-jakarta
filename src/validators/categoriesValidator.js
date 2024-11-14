const { check, validationResult, matchedData } = require('express-validator');

const postValidationRules = () => {
    return [
        check('name')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Category Article name is required.')
        .isLength({ max: 255 })
        .withMessage('Category Article name must be no more than 255 characters.'),
    ];
};

const updateValidationRules = () => {
    return [
        check('name')
        .isString()
        .notEmpty()
        .withMessage('Category Article name is required.')
        .trim()
        .isLength({ max: 255 })
        .withMessage('Category Article name must be no more than 255 characters.'),
];
};

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 400, errors: errors.array() });
    }

    req.body = matchedData(req, { onlyValidData: true });
    next();
};

module.exports = {
    postValidationRules,
    updateValidationRules,
    validate,
};
