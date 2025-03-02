const { sendResponse } = require('../helpers/response');

exports.checkFile = (fieldName, isRequired = true, action = 'upload') => {
  return (req, res, next) => {
    try {
      if (!req.files?.[fieldName]) {
        return isRequired
          ? sendResponse(res, 400, `${fieldName} is required.`)
          : next();
      }

      const file = req.files[fieldName];
      const maxSize = 5_000 * 1024; // 5 MB
      if (file.size > maxSize) {
        return sendResponse(
          res,
          400,
          `${fieldName} size is more than ${maxSize / 1024} KB.`,
        );
      }
      next();
    } catch (error) {
      return sendResponse(res, 500, `Error processing file ${action}.`);
    }
  };
};
