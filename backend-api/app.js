const commander = require("commander");
const express = require("express");
const readline = require("readline");
const _ = require("lodash");
const mongoose = require('mongoose');
const dotenv = require("dotenv");

const morgan = require("morgan");
const logger = require('./app/middleware/logger');

const Parser = require("./app/Parser.js");
const PapersController = require("./app/controllers/PapersController.js");

const PaperSchema = require("./app/models/PaperSchema");

const app = express();

dotenv.load();

app.use(morgan("dev"));

// Init database connection
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

const papersController = new PapersController();

// init handlers
const handlers = require('./app/handlers/index.js')({
  logger,
  db,
  papersController
});

commander
  .version("0.1.0")
  .option(
    "-d, --directory <directory>",
    "Directory where json file(s) are located"
  )
  .option("-p, --port <port>", "Port served on")
  .option("-s, --silent [silent]", "silent")
  .parse(process.argv);

/** arguments */

const verbose = !commander.silent;

// eslint-disable-next-line prefer-destructuring
let port = commander.port;
if (!port) {
  port = 3000;
  logger.info("Using default port:", port);
} else {
  logger.info("Using port:", port);
}

if (!commander.directory) {
  commander.directory = "./data";
  logger.info("Using default data directory:", commander.directory);
} else {
  logger.info("Using data directory:", commander.directory);
}

/**
 * Business Logic
 */

/**
 * Returns the topN papers.
 *
 * @param {integer} topN number of papers (default is 10)
 */
function getTopPapers(options) {
  options = options || {};
  const topN = options.topN || 5;
  const papers = papersController.getPapers();
  const papersDict = papersController.getPapersObject();

  let topPapers = papers;

  if (options.paperFilter) {
    topPapers = topPapers.filter(options.paperFilter);
  }
  topPapers = topPapers
    .sort((paper1, paper2) =>
      paper2.getInCitations().length - paper1.getInCitations().length)
    .slice(0, topN);
  topPapers.forEach(paper =>
    paper.setInCitations(paper.getInCitations().map(inCitationId => {
      return papersDict[inCitationId] || inCitationId;
    })));

  return topPapers;
}

/**
 * Returns the publication trends information.
 *
 * @param {*} options
 */
function getPublicationTrends(options) {
  options = options || {};

  const publicationsByYear = papersController.group({
    groupsFromPaper: paper => [paper.getYear() || 0],
    paperFilter: options.paperFilter
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(publicationsByYear)) {
    publicationsByYear[key] = {
      count: publicationsByYear[key].length
    };
  }

  return publicationsByYear;
}

function getInCitationsGraph(options) {
  function minimizePaper(paper, level) {
    return {
      id: paper.getId(),
      level,
      authors: paper.getAuthors(),
      title: paper.getTitle()
    };
  }

  const allPapers = papersController.getPapersObject();

  const nodes = [];
  const links = [];

  function dig(paper, level, maxLevel) {
    nodes.push(minimizePaper(paper, level));
    if (level < maxLevel) {
      const inCitations = paper.getInCitations();
      inCitations.forEach(inCitation => {
        const inCitationId = inCitation.getId ? inCitation.getId() : inCitation;
        if (allPapers[inCitationId]) {
          links.push({
            source: inCitationId,
            target: paper.getId()
          });
          dig(allPapers[inCitationId], level + 1, maxLevel);
        }
      });
    }
  }

  options = options || {};
  options.levels = options.levels || 3;
  options.title = options.title || "";

  let paperId = _.find(
    Object.keys(allPapers),
    paperId =>
    allPapers[paperId].getTitle().toLowerCase() === options.title.toLowerCase()
  );
  paperId =
    paperId ||
    _.maxBy(
      Object.keys(allPapers),
      paperId => allPapers[paperId].getInCitations().length
    );

  const paper = allPapers[paperId];
  dig(paper, 1, options.levels);

  return {
    nodes,
    links
  };
}

/**
 * Returns the key phrases trends information.
 *
 * @param {*} options
 */
function getKeyPhrasesTrends(options) {
  options = options || {};

  const keyPhrasesByYear = papersController.group({
    groupsFromPaper: paper => [paper.getYear() || 0],
    paperFilter: options.paperFilter
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(keyPhrasesByYear)) {
    keyPhrasesByYear[key] = {
      count: keyPhrasesByYear[key].length
    };
  }

  return keyPhrasesByYear;
}

/**
 * Define app
 */

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

app.get("/top-authors", handlers.topAuthorHandler);

app.get("/top-papers", (req, res) => {
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
});

app.get("/trends/publication", handlers.trendPublicationHandler);

app.get("/trends/keyphrase", handlers.trendKeyPhraseHandler);

app.get("/graph/incitation", (req, res) => {
  const params = req.query;

  const options = {};
  options.title = params.title;
  options.levels = params.levels;

  res.send(JSON.stringify(getInCitationsGraph(options)));
});

function startServer() {
  const server = app.listen(process.env.PORT, () => {
    logger.info(`Listening on port ${server.address().process.env.PORT}`);
  });
}

/**
 * Parse the data files and start the server.
 */
const parser = new Parser();
let i = 0;

startServer();

/* if (verbose) {
  parser.setEventHandler("onLineParsed", line => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Parsed lines: ${++i}`);
  });

  parser.setEventHandler("onFilesParsedComplete", line => {
    process.stdout.write("\n");
  });
}

parser.parseDirectory(commander.directory).then(
  parsedPapers => {
    papersController.setPapers(parsedPapers);
    startServer();
  },
  err => {
    logger.error(err);
  }
); */
