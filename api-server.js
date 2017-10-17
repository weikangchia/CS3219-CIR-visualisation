"use strict";

var commander = require("commander");
var Parser = require("./Parser.js");
const express = require("express");
const path = require("path");

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
}else{
  console.log("Using port: ", port);
  
}

if (!commander.directory) {
  commander.directory = "./data";
  console.log("Using default data directory: ", commander.directory);
}else {
  console.log("Using data directory: ", commander.directory);
}

/**
 * Define app
 */
const app = express();
var papers

app.get("/", (req, res) => {
  res.send("hello world " + papers.length);
});

app.all("/", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

/**
 * Parse data files and start server
 */
var parser = new Parser();
parser.parseDirectory(commander.directory).then(
  parsedPapers => {
    papers = parsedPapers
    app.listen(port, () => {
      console.log("API serving on port 3000!");
    });
  },
  err => {
    console.error(err);
  }
);
