"use strict";

var fs = require("fs");
var readline = require("readline");
var walk = require("walk");
var _ = require("lodash");
var Paper = require("./core/Paper.js");
var Author = require("./core/Author.js");

var Parser = (function() {
  var Constructor = function() {
    this.eventHandlers = {};
  };

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
        author.setId(authorObj.id);
        author.setName(authorObj.name);

        paper.addAuthor(author);
      }, this);

      paper.setTitle(obj.title);
      paper.setVenue(obj.venue);
      resolve(paper);
    });
  }

  Constructor.prototype = {
    setEventHandler: function(event, handler) {
      this.eventHandlers[event] = handler;
    },
    /**
     * Invokes handler if exists
     */
    handleEvent: function(event, data) {
      if (this.eventHandlers[event]) {
        this.eventHandlers[event](data);
      }
      return data;
    },
    /**
     * Generates a handle event function to use as thenable
     */
    generateHandleEvent: function(event) {
      return data => this.handleEvent(event, data);
    },
    /**
     * resolves Paper[]
     */
    parseDirectory: function(directory) {
      return new Promise((resolve, reject) => {
        fs.lstat(
          directory,
          (err, lstat) => {
            if (!err && lstat.isDirectory()) {
              this.walkDirectoryAndParse(directory)
                .then(this.generateHandleEvent("onFilesParsedComplete"))
                .then(resolve);
            } else {
              return reject(new Error("INVALID_DIRECTORY"));
            }
          },
          reject
        );
      });
    },

    /**
   * 
   * @param {*} directory Valid directory name
   */
    walkDirectoryAndParse: function(directory) {
      return new Promise((resolve, reject) => {
        var walker = walk.walk(directory);
        var walks = [];
        var papers;
        walker.on("file", (root, fileStats, next) => {
          if (fileStats.name.endsWith("json")) {
            var filePath = directory + "/" + fileStats.name;
            walks.push(this.parseFile(filePath));
          }
          next();
        });

        walker.on("errors", (root, nodeStatsArray, next) => {
          console.error(nodeStatsArray);
          next();
        });

        walker.on("end", () => {
          Promise.all(walks).then(arrayOfPapers => {
            resolve(_.flatten(arrayOfPapers));
          }, reject);
        });
      });
    },

    /**
   * Resolves Paper[]
   */
    parseFile: function(filePath) {
      return new Promise((resolve, reject) => {
        var parseLines = [];

        var lineReader = readline.createInterface({
          input: fs.createReadStream(filePath)
        });

        lineReader.on("line", line => {
          parseLines.push(
            parseLine(line).then(this.generateHandleEvent("onLineParsed"))
          );
        });

        lineReader.on("close", function() {
          Promise.all(parseLines).then(papers => {
            resolve(papers);
          });
        });
      });
    }
  };
  return Constructor;
})();

module.exports = Parser;
