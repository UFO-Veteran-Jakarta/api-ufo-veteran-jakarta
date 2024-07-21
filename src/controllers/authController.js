const authService = require("../services/authService");
const { sendResponse } = require("../helpers/response");
const { sign } = require("../utils/jwt");
const logger = require("../utils/logger");

exports.register = async (req, res) => {
  try {
    const data = await authService.getUserByUsername(req.body.username);

    if (data.length > 0) {
      logger.error("Register Error: Username already taken");
      return sendResponse(res, 500, "Username already taken");
    }

    await authService.createUser(req.body);

    return sendResponse(res, 200, "Successfully registered new user!");
  } catch (error) {
    logger.error("Register Error: Failed register");
    return sendResponse(res, 500, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await authService.login(req.body);
    if (!user) {
      logger.error("Login Error: Failed to login");
      return sendResponse(res, 500, "Failed to login!");
    }
    const token = sign(user);
    res.cookie("token", token, {
      maxAge: 3 * 60 * 60 * 1000,
      httpOnly: true,
    });
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
    logger.error("Login Error: Failed to login");
    return sendResponse(res, 500, err.message);
  }
};

exports.logout = async (req, res) => {
  if (!req?.cookies?.token) {
    logger.error("Logout Error: Failed to logout");
    return sendResponse(res, 401, "Unauthorized");
  }
  res.clearCookie("token");
  return sendResponse(res, 200, "Success Logout!");
};
