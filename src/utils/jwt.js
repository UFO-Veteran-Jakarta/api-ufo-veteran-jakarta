const jwt = require("jsonwebtoken");
exports.sign = (user) => {
  return jwt.sign(
    { sub: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "3h" }
  );
};

exports.verify = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
