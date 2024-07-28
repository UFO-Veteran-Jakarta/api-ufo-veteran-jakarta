const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const limiter = require("./utils/limiter");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(limiter);
app.use(fileUpload());

app.use("/api/v1", routes);

module.exports = app;
