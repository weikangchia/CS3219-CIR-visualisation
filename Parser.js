"use strict";

var fs = require("fs");
var readline = require("readline");
var walk = require("walk");
var _ = require("lodash");
var Paper = require("./core/Paper.js");
var Author = require("./core/Author.js");

var Parser = (function() {
  var Constructor = function() {};

  /**
   * Resolves a Paper object
   * @param {*} line 
   */
  function parseLine(line) {
    return new Promise((resolve, reject) => {
      var obj = JSON.parse(line);

      var paper = new Paper();

      obj.authors.forEach(function(authorObj) {
        var author = new Author();
        author.id = authorObj.id;
        author.name = authorObj.name;
        paper.addAuthor(author);
      }, this);
      paper.title = obj.title;
      resolve(paper);
    });
  }

  /**
   * Resolves Paper[]
   */
  function parseFile(filePath) {
    return new Promise((resolve, reject) => {
      var parseLines = [];

      var lineReader = readline.createInterface({
        input: fs.createReadStream(filePath)
      });

      lineReader.on("line", function(line) {
        parseLines.push(parseLine(line));
      });

      lineReader.on("close", function() {
        Promise.all(parseLines).then(papers => {
          resolve(papers);
        });
      });
    });
  }
  /**
   * 
   * @param {*} directory Valid directory name
   */
  function walkDirectoryAndParse(directory) {
    return new Promise((resolve, reject) => {
      var walker = walk.walk(directory);
      var walks = [];
      var papers;
      walker.on("file", function(root, fileStats, next) {
        if(fileStats.name.endsWith('json')){
          var filePath = directory + "/" + fileStats.name;
          walks.push(parseFile(filePath));
        }
        next();
      });

      walker.on("errors", function(root, nodeStatsArray, next) {
        console.error(nodeStatsArray);
        next();
      });

      walker.on("end", function() {
        Promise.all(walks).then(arrayOfPapers => {
          resolve(_.flatten(arrayOfPapers));
        }, reject);
      });
    });
  }

  Constructor.prototype = {
    /**
     * resolves Paper[]
     */
    parseDirectory: function(directory) {
      return new Promise((resolve, reject) => {
        fs.lstat(
          directory,
          (err, lstat) => {
            if (!err && lstat.isDirectory()) {
              walkDirectoryAndParse(directory).then(resolve);
            } else {
              return reject(new Error("INVALID_DIRECTORY"));
            }
          },
          reject
        );
      });
    }
  };
  return Constructor;
})();

module.exports = Parser;
