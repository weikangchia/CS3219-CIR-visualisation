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

app.get("/trends/publication", handlers.trendPublicationHandler);

app.get("/trends/keyphrase", handlers.trendKeyPhraseHandler);

const server = app.listen(process.env.PORT, () => {
  logger.info(`Listening on port ${server.address().port}`);
});
