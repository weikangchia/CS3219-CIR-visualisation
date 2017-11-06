const express = require("express");
const mongoose = require('mongoose');
const dotenv = require("dotenv");

const morgan = require("morgan");
const logger = require('./app/middleware/logger');

const PaperSchema = require("./app/models/PaperSchema");

const app = express();

dotenv.load();

app.use(morgan("dev"));

// init database connection
mongoose.connect(process.env.MONGO_DB_URI, {
  useMongoClient: true
}, err => {
  if (err) {
    logger.error(`Could not connect to database: ${err}`);
  } else {
    logger.info(`Connected to database: ${process.env.MONGO_DB_URI}`);
  }
});

const db = mongoose.connection;
db.model("Paper", PaperSchema, "papers");

// init handlers
const handlers = require('./app/handlers/index.js')({
  logger,
  db
});

// routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader("Content-Type", "application/json");

  next();
});

app.get("/", (req, res) => {
  res.send(JSON.stringify({
    mode: "test"
  }));
});

app.get("/top-X-of-Y", handlers.topNXofYHandler);

// app.get("/top-authors", handlers.topAuthorHandler);

/* app.get("/top-papers", (req, res) => {
  const params = req.query;

  const options = {};
  const paperFilters = [];

  if (params.venue) {
    paperFilters.push(paper => paper.getVenue().toLowerCase() === params.venue.toLowerCase());
  }

  if (params.topN) {
    options.topN = params.topN;
  }

  if (paperFilters.length > 0) {
    options.paperFilter = paper =>
      paperFilters.every(paperFilter => paperFilter(paper));
  }
  res.send(JSON.stringify(getTopPapers(options)));
}); */

app.get("/trends/publication", handlers.trendPublicationHandler);

app.get("/trends/keyphrase", handlers.trendKeyPhraseHandler);

/* app.get("/graph/incitation", (req, res) => {
  const params = req.query;

  const options = {};
  options.title = params.title;
  options.levels = params.levels;

  res.send(JSON.stringify(getInCitationsGraph(options)));
}); */

const server = app.listen(process.env.PORT, () => {
  logger.info(`Listening on port ${server.address().port}`);
});
