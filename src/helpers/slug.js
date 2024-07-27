const slugify = require("slugify");
const crypto = require("crypto");

exports.generateUniqueSlug = (title) => {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const uniqueCode = crypto.randomBytes(4).toString("hex"); // Menghasilkan 8 karakter acak
  return `${baseSlug}-${uniqueCode}`;
};
