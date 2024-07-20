const { sendResponse } = require("../helpers/response");
const { verify } = require("../utils/jwt");

exports.checkMethod = (allowedMethods) => {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ status: 405, message: "Wrong method" });
    }
    next();
  };
};

exports.authentication = () => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      const refreshToken = req?.cookies?.token;

      if (!(token && refreshToken)) {
        return sendResponse(res, 401, "Unauthorized");
      }

      verify(token);
      verify(refreshToken);
    } catch (err) {
      return sendResponse(res, 401, err.message);
    }

    next();
  };
};
