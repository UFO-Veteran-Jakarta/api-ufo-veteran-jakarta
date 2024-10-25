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
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';

    const upper = upperChars[crypto.randomInt(upperChars.length)];
    const lower = lowerChars[crypto.randomInt(lowerChars.length)];
    const num = numbers[crypto.randomInt(numbers.length)];

    const allChars = upperChars + lowerChars + numbers;
    const remainingLength = 13;

    let remaining = '';
    for (let i = 0; i < remainingLength; i += 1) {
      remaining += allChars[crypto.randomInt(allChars.length)];
    }

    const combined = upper + lower + num + remaining;
    const shuffled = combined
      .split('')
      .map((value) => ({ value, sort: crypto.randomInt(1000000) }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .join('');

    return shuffled;
  };

  const randomFilename = generateRandomFilename() + ext;
  const filePath = path.join(uploadDir, randomFilename);

  fs.writeFileSync(filePath, file.data);
  return `/images/divisions/${randomFilename}`;
};

module.exports = uploadFileDivision;
