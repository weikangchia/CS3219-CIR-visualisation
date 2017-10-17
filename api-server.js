"use strict";

const commander = require("commander");
const express = require("express");
const path = require("path");
const Parser = require("./Parser.js");
const PapersController = require("./Controllers/PapersController.js");
const _ = require("lodash");

commander
  .version("0.1.0")
  .option(
    "-d, --directory <directory>",
    "Directory where json file(s) are located"
  )
  .option("-p, --port <port>", "Port served on")
  .parse(process.argv);

var port = commander.port;
if (!port) {
  port = 3000;
  console.log("Using default port: ", port);
} else {
  console.log("Using port: ", port);
}

if (!commander.directory) {
  commander.directory = "./data";
  console.log("Using default data directory: ", commander.directory);
} else {
  console.log("Using data directory: ", commander.directory);
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
  console.log("Incoming request: ", req);
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
    console.log("API serving on port 3000!");
  });
}
/**
 * Parse data files and start server
 */
var parser = new Parser();
parser.parseDirectory(commander.directory).then(
  parsedPapers => {
    papersController.setPapers(parsedPapers);
    startServer();
  },
  err => {
    console.error(err);
  }
);
