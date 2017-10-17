"use strict";

var commander = require("commander");
var Parser = require("./Parser.js");

commander
  .version("0.1.0")
  .option(
    "-d, --directory <directory>",
    "Directory where json file(s) are located"
  )
  .parse(process.argv);

var parser = new Parser();
parser.parseDirectory(commander.directory).then(
  dir => {
    console.log(dir);
  },
  err => {
    console.error(err);
  }
);
