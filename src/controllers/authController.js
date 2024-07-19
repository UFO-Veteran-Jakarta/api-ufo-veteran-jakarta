const authService = require("../services/authService");
const { sendResponse } = require("../helpers/response");
const { sign } = require("../utils/jwtSign");

exports.register = async (req, res) => {
  try {
    const data = await authService.getUserByUsername(req.body.username);

    if (data.length > 0) {
      return sendResponse(res, 500, "Username already taken");
    }

    await authService.createUser(req.body);

    return sendResponse(res, 200, "Successfully registered new user!");
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    if (!user) {
      return sendResponse(res, 500, "Failed to login!");
    }
    const token = sign(user);
    return sendResponse(
      res,
      200,
      "Successfully logged in!",
      {
        id: user.id,
        username: user.username,
      },
      { token, type: "bearer" }
    );
  } catch (err) {
    return sendResponse(res, 500, err.message);
  }
};
