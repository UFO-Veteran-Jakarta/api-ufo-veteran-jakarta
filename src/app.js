const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const exampleRoutes = require("./routes/exampleRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/api", exampleRoutes);

module.exports = app;
