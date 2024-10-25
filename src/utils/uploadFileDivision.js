const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const uploadFileDivision = (file) => {
  if (!file) return null;

  const uploadDir = './public/images/divisions/';

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(file.name);

  const generateRandomFilename = () => {
    let baseSlug;

    do {
      baseSlug = crypto
        .randomBytes(18)
        .toString('base64')
        .replace(/\+/g, 'A')
        .replace(/\//g, 'B')
        .replace(/=+$/, '');
    } while (
      !/[A-Z]/.test(baseSlug) ||
      !/[a-z]/.test(baseSlug) ||
      !/\d/.test(baseSlug)
    );

    return baseSlug.substring(0, 16);
  };

  const randomFilename = generateRandomFilename() + ext;
  const filePath = path.join(uploadDir, randomFilename);

  fs.writeFileSync(filePath, file.data);
  return `/images/divisions/${randomFilename}`;
};

module.exports = uploadFileDivision;
