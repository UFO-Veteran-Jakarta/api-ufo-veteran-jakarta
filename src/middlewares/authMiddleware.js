exports.checkMethod = (allowedMethods) => {
  return (req, res, next) => {
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ status: 405, message: "Wrong method" });
    }
    next();
  };
};
