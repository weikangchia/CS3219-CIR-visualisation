const express = require("express");
const path = require("path");
const dotenv = require("dotenv");

const morgan = require("morgan");
const compression = require("compression");
const logger = require('./app/middleware/logger');

const app = express();

dotenv.load();

app.use(morgan("dev"));
app.use(compression());

app.use('/', express.static(path.join(__dirname, 'public'), {
  extensions: ['html']
}));

app.use('/home', (req, res) => {
  res.sendFile('/public/index.html', {
    root: __dirname
  });
});

const server = app.listen(process.env.PORT, () => {
  logger.info(`Listening on port ${server.address().port}`);
});
