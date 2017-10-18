"use strict";

const commander = require("commander");
const express = require("express");
const path = require("path");
const Parser = require("./Parser.js");
const PapersController = require("./Controllers/PapersController.js");
const _ = require("lodash");
const readline = require("readline");

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

var verbose = !commander.silent;

function log(...args) {
  if (verbose) {
    console.log(...args);
  }
}

var port = commander.port;
if (!port) {
  port = 3000;
  log("Using default port: ", port);
} else {
  log("Using port: ", port);
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
function getTopAuthors(topN) {
  topN = topN || 10;
  var topAuthors = papersController.group({
    groupsFromPaper: function(paper) {
      return paper.getAuthors().map(author => {
        return author.name;
      });
    },
    filterPaper: function(paper) {
      return true;
    }
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
        count: topAuthors[author].length
      };
    });

  return topAuthors;
}

/**
 * Define app
 */
const app = express();
const papersController = new PapersController();

app.use(function(req, res, next) {
  log("Incoming request: ", req.path, req.query);
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.setHeader("Content-Type", "application/json");

  next();
});

app.get("/", (req, res) => {
  res.send(JSON.stringify({ mode: "test" }));
});

app.get("/top-authors", (req, res) => {
  if (req) {
  }

  res.send(JSON.stringify(getTopAuthors()));
});

function startServer() {
  app.listen(port, () => {
    log("API serving on port 3000!");
  });
}

/**
 * Parse data files and start server
 */
var parser = new Parser();
var i = 0;

if (verbose) {
  parser.setEventHandler("onLineParsed", line => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write("Parsed lines: " + ++i);
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
    console.error(err);
  }
);
