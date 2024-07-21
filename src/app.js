const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const migrate = require("./migration/users");
const limiter = require("./utils/limiter");
// const pool = require("./config/database");

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(limiter);
app.use("/api/v1", routes);

module.exports = app;
