const express = require("express");
const path = require("path");

const morgan = require("morgan");
const compression = require("compression");
const logger = require('./app/middleware/logger');

const app = express();

app.use(morgan("dev"));
app.use(compression());

app.use('/', express.static(path.join(__dirname, 'public')));

app.use('/home', (req, res) => {
  res.sendFile('/public/index.html', {
    root: __dirname
  });
});

app.use('/top-authors', (req, res) => {
  res.sendFile('/public/top10-authors.html', {
    root: __dirname
  });
});

app.use('/top-papers', (req, res) => {
  res.sendFile('/public/top5-papers.html', {
    root: __dirname
  });
});

app.use('/trends-conference', (req, res) => {
  res.sendFile('/public/trends-conference.html', {
    root: __dirname
  });
});

app.use('/trends-keyphrase', (req, res) => {
  res.sendFile('/public/trends-keyphrase.html', {
    root: __dirname
  });
});

app.use('/graphs-incitations', (req, res) => {
  res.sendFile('/public/graph-incitation.html', {
    root: __dirname
  });
});

const server = app.listen(9000, () => {
  logger.info(`Listening on port ${server.address().port}`);
});
