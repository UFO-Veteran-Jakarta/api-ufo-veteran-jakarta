const jwt = require("jsonwebtoken");
exports.sign = (user) => {
  console.log(process.env.JWT_SECRET);
  return jwt.sign(
    { sub: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
};
