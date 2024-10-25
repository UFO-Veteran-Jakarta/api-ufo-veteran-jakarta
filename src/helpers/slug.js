const slugify = require('slugify');
const crypto = require('crypto');

exports.generateUniqueSlug = (title) => {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const uniqueCode = crypto.randomBytes(4).toString('hex');
  return `${baseSlug}-${uniqueCode}`;
};

exports.createSlugDivision = async (title, checkSlugExistsInDb) => {
  const cleanedTitle = title.replace(/\//g, '-').replace(/_/g, '-');
  const baseSlug = slugify(cleanedTitle, { lower: true, strict: true });

  const exists = await checkSlugExistsInDb(baseSlug);

  if (!exists) {
    return baseSlug;
  }

  const uniqueCode = crypto.randomBytes(4).toString('hex');
  return `${baseSlug}-${uniqueCode}`;
};
