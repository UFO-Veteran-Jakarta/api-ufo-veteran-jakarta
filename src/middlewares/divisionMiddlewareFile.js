const path = require('path');
const fs = require('fs');

const checkFileDivision = (req, res, next) => {

  if (!req.files?.image) {
    return res.status(400).json({ status: 400, message: 'Image is required.' });
  }

  const image = req.files.image;

  const maxSize = 500 * 1024; 
  if (image.size > maxSize) {
    return res
      .status(500)
      .json({ status: 413, message: 'Image size is more than 500 KB.' });
  }

  const ext = path.extname(image.name).toLowerCase();
  if (ext !== '.webp') {
    return res
      .status(500)
      .json({ status: 413, message: 'Image must be in WEBP Format.' });
  }


  const uploadDir = './public/images/divisions/';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  next();
};

module.exports = checkFileDivision;
