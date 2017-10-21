const commander = require("commander");
const express = require("express");
const Parser = require("./Parser.js");
const PapersController = require("./controllers/PapersController.js");
const readline = require("readline");
const _ = require("lodash");

const app = express();
const papersController = new PapersController();

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

function log(...args) {
  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
}

// eslint-disable-next-line prefer-destructuring
let port = commander.port;
if (!port) {
  port = 3000;
  log("Using default port:", port);
} else {
  log("Using port:", port);
}

if (!commander.directory) {
  commander.directory = "./data";
  log("Using default data directory: ", commander.directory);
} else {
  log("Using data directory: ", commander.directory);
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
 * @param {integer}
 */
function getPublicationTrends(options) {
  options = options || {};

  const topN = options.topN || 10;

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
            source: paper.getId(),
            target: inCitationId
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
  log("Incoming request:", req.path, req.query);
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

app.get("/top-authors", (req, res) => {
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

  res.send(JSON.stringify(getTopAuthors(options)));
});

app.get("/top-papers", (req, res) => {
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

function startServer() {
  app.listen(port, () => {
    log("API serving on port 3000!");
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
    // eslint-disable-next-line no-console
    console.error(err);
  }
);
