const path = require('path');
const fs = require('fs');
const { generateRandomFilename } = require('../helpers/slug');

const uploadFileDivision = (file) => {
  if (!file) return null;

  const uploadDir = './public/images/divisions/';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const randomFilename = generateRandomFilename(file.originalname);
  const filePath = path.join(uploadDir, randomFilename);

  fs.writeFileSync(filePath, file.buffer);
  return `/images/divisions/${randomFilename}`;
};

module.exports = uploadFileDivision;
