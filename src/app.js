const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const limiter = require('./utils/limiter');
const routes = require('./routes');

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(limiter);
app.use(fileUpload());

app.use('/api/v1', routes);

module.exports = app;
