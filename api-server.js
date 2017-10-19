const commander = require("commander");
const express = require("express");
const Parser = require("./Parser.js");
const PapersController = require("./controllers/PapersController.js");
const _ = require("lodash");
const readline = require("readline");

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
 * @param {integer} topN number of authors (default is 10)
 */
function getTopAuthors(options) {
  options = options || {};
  let topN = options.topN || 10;
  let topAuthors = papersController.group({
    groupsFromPaper: paper => {
      return paper.getAuthors().map(author => {
        return author.name;
      });
    },
    paperFilter: options.paperFilter
  });

  topAuthors = Object.keys(topAuthors)
    .sort(
      (author1, author2) =>
        topAuthors[author2].length - topAuthors[author1].length
    )
    .slice(0, topN)
    .map(author => {
      return {
        author: author,
        count: topAuthors[author].length,
        papers: topAuthors[author]
      };
    });

  return topAuthors;
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
  res.send(
    JSON.stringify({
      mode: "test"
    })
  );
});

app.get("/top-authors", (req, res) => {
  const params = req.query;

  const options = {};
  const paperFilters = [];

  if (params.venue) {
    paperFilters.push(
      paper => paper.getVenue().toLowerCase() === params.venue.toLowerCase()
    );
  }

  if (paperFilters.length > 0) {
    options.paperFilter = paper =>
      paperFilters.every(paperFilter => paperFilter(paper));
  }

  res.send(JSON.stringify(getTopAuthors(options)));
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
