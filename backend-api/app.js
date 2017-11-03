const commander = require("commander");
const express = require("express");
const readline = require("readline");
const _ = require("lodash");
const db = require('mongoose');
//const mongoimport = require('mongoimport');

const morgan = require("morgan");
const logger = require('./app/middleware/logger');

const Parser = require("./app/Parser.js");
const PapersController = require("./app/controllers/PapersController.js");

const app = express();

app.use(morgan("dev"));

// TODO connect to DB here
db.connect('mongodb://localhost/cs3219');
connect =  db.connection
connect.on('error', console.error.bind(console, 'connection error:'));
connect.once('open', function() {
  logger.info("mongoose connected");
});

var paperSchema = db.Schema({
  title: String,
  authors: Array,//[Schema.Types.ObjectId],
  venue: String,
  inCitations: [String],
  outCitations: [String],
  year: Number,
  abstract: String,
  keyPhrases: [String]
});
var Paper = db.model('papers', paperSchema);

const papersController = new PapersController();

// init handlers
const handlers = require('./app/handlers/index.js')({
  logger: logger,
  db : db,
  models : {
    Paper
  },
  papersController : papersController
})

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
 * Returns the topN authors.
 *
 * @param {integer} topN number of authors (default is 10)
 */
function getTopAuthors(options) {
  options = options || {};
  const topN = options.topN || 10;

  const authors = papersController.getAuthorsObject();
  let topAuthors = papersController.group({
    groupsFromPaper: paper =>
      paper.getAuthors().map(author => author.getId() || author.getName()),
    paperFilter: options.paperFilter
  });

  topAuthors = Object.keys(topAuthors)
    .sort((author1, author2) =>
      topAuthors[author2].length - topAuthors[author1].length)
    .slice(0, topN)
    .map(authorId => {
      return {
        author: authors[authorId],
        count: topAuthors[authorId].length,
        papers: topAuthors[authorId]
      };
    });

  return topAuthors;
}

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
 * Returns co-Authors Information
 *
 * @param {*, function} options, callback function
 */
function getCoAuthorsGraph(options, callback) {

  var nodes = [];
  var links = [];
  let set = new Set();
  let setPapers = new Set();

  function minimizeAuthor(author, paper, level) {
    var authorObj = paper.authors.find(authorObj => authorObj.ids[0] === author);
    return {
      id: author, 
      level,
      author: authorObj? authorObj.name : "undefined",
      title: paper.title? paper.title : "undefined"
      };
  }

  function dig(paper, level, maxLevel, source) {
    if(!set.has(source)) {
      nodes.push(minimizeAuthor(source, paper, level));
    }
    set.add(source);
    if (level < maxLevel && paper != undefined && !setPapers.has(paper._id)) {
      setPapers.add(paper._id);
      const authors = paper.authors;
      authors.forEach(author => {
        const authorId = author.ids[0] ? author.ids[0] : "undefined";
        if (authorId != source) {
          nodes.push(minimizeAuthor(authorId, paper, level+1));
          set.add(authorId);
          links.push({
            source: authorId,
            target: source
          });
          Paper.find({ "authors.name": author.name }, function(err, papers){
            if(err) throw error;
            papers.forEach(paper => {
              dig(paper, level + 1, maxLevel, authorId)
            });
          });
        };
      });
    }
  }

  options = options || {};
  options.levels = options.levels || 3;
  options.author = options.author || "";
  curLevel = 1;

  Paper.find({ "authors.name": options.author }, function(err, papers){
    if(err) throw error;
    papers.forEach(paper => {
      const authors = paper.authors;
      var authorId = undefined;
      authors.forEach(author => {
        if (author.name === options.author) {
          authorId = author.ids[0]?author.ids[0]:"undefined";
        }
      })

      if(authorId == undefined) {
        nodes.push(minimizeAuthor(authorId, paper, curlevel));
      };

      dig(paper, curLevel, options.levels, authorId);
      if(typeof callback === "function") {
        callback(nodes, links);
      }
    });
  });
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

app.get("/trends/publication", (req, res) => {
  const params = req.query;

  const options = {};
  const paperFilters = [];

  if (params.venue) {
    paperFilters.push(paper => paper.getVenue().toLowerCase() === params.venue.toLowerCase());
  }

  if (paperFilters.length > 0) {
    options.paperFilter = paper =>
      paperFilters.every(paperFilter => paperFilter(paper));
  }

  res.send(JSON.stringify(getPublicationTrends(options)));
});

app.get("/trends/keyphrase", (req, res) => {
  const params = req.query;

  const options = {};
  const paperFilters = [];

  paperFilters.push(paper => {
    return paper.getKeyPhrases().some(phrase => {
      return phrase.toLowerCase() === params.phrase.toLowerCase();
    });
  });

  if (paperFilters.length > 0) {
    options.paperFilter = paper =>
      paperFilters.every(paperFilter => paperFilter(paper));
  }

  res.send(JSON.stringify(getKeyPhrasesTrends(options)));
});

app.get("/graph/incitation", (req, res) => {
  const params = req.query;

  const options = {};
  options.title = params.title;
  options.levels = params.levels;

  res.send(JSON.stringify(getInCitationsGraph(options)));
});

app.get("/graph/co-Authors", (req, res) => {
  const params = req.query;

  const options = {};
  options.author = params.author;
  options.levels = params.levels;
  getCoAuthorsGraph(options, function(nodes, links) {
    res.send(JSON.stringify({nodes, links}));
  })
});

function startServer() {
  const server = app.listen(port, () => {
    logger.info(`Listening on port ${server.address().port}`);
  });
}

/**
 * Parse the data files and start the server.
 */
const parser = new Parser();
let i = 0;

if (verbose) {
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
);
