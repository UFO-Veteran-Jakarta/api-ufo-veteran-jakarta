const { sendResponse } = require('../helpers/response');
const { verify } = require('../utils/jwt');

exports.checkMethod = (allowedMethods) => (req, res, next) => {
  if (!allowedMethods.includes(req.method)) {
    res.status(405).json({ status: 405, message: 'Wrong method' });
  } else {
    next();
  }
};

// eslint-disable-next-line consistent-return
exports.authentication = () => (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const refreshToken = req?.cookies?.token;

    if (!(token && refreshToken)) {
      return sendResponse(res, 401, 'Unauthorized');
    }

    verify(token);
    verify(refreshToken);
  } catch (err) {
    return sendResponse(res, 401, err.message);
  }

  next();
};
