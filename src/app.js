const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const migrate = require("./migration/users");
const limiter = require("./utils/limiter");
const multer = require("multer");
// const pool = require("./config/database");

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(limiter);
app.use("/api/v1", routes);
app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    res.status(500).json({ error: err.message });
  } else if (err) {
    res.status(500).json({ error: err.message });
  } else {
    next();
  }
});

module.exports = app;
