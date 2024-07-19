const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    console.log("WWWWW", req.body);
    const data = await authService.getUserByUsername(req.body.username);
    console.log("WEOFJWEOFJ", data);
    if (data.length > 0) {
      return res
        .status(500)
        .json({ status: 500, message: "Username already taken" });
    }

    const createUser = await authService.createUser(req.body);
    console.log(createUser);
    const response = {
      message: "Successfully registered new user!",
      status: 200,
    };

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
