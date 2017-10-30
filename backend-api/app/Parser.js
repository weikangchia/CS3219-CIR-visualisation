const fs = require("fs");
const readline = require("readline");
const walk = require("walk");
const _ = require("lodash");

const logger = require('./middleware/logger');

const Paper = require("./paper/Paper.js");
const Author = require("./author/Author.js");

/**
 * Resolves a Paper object.
 *
 * @param {*} line
 */
function parseLine(line) {
  return new Promise((resolve, reject) => {
    const obj = JSON.parse(line);

    const paper = new Paper();

    obj.authors.forEach(authorObj => {
      const author = new Author();
      author.setId(authorObj.ids[0]);
      author.setName(authorObj.name);

      paper.addAuthor(author);
    }, this);

    paper.setTitle(obj.title);
    paper.setId(obj.id);
    paper.setVenue(obj.venue);
    paper.setInCitations(obj.inCitations);
    paper.setOutCitations(obj.outCitations);
    paper.setYear(obj.year);
    paper.setAbstract(obj.paperAbstract);
    paper.setKeyPhrases(obj.keyPhrases);

    resolve(paper);
  });
}
class Parser {
  constructor() {
    this.eventHandlers = {};
  }

  setEventHandler(event, handler) {
    this.eventHandlers[event] = handler;
  }

  handleEvent(event, data) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event](data);
    }

    return data;
  }

  /**
   * Generates a handle event function to use as thenable
   */
  generateHandleEvent(event) {
    return data => this.handleEvent(event, data);
  }

  /**
   * Resolves Paper[]
   */
  parseDirectory(directory) {
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
  }

  /**
   * Walks thr directory and parse the objects.
   *
   * @param {*} directory Valid directory name
   */
  walkDirectoryAndParse(directory) {
    return new Promise((resolve, reject) => {
      const walker = walk.walk(directory);
      const walks = [];
      walker.on("file", (root, fileStats, next) => {
        if (fileStats.name.endsWith("json")) {
          const filePath = `${directory}/${fileStats.name}`;
          walks.push(this.parseFile(filePath));
        }
        next();
      });

      walker.on("errors", (root, nodeStatsArray, next) => {
        logger.error(nodeStatsArray);
        next();
      });

      walker.on("end", () => {
        Promise.all(walks).then(arrayOfPapers => {
          resolve(_.flatten(arrayOfPapers));
        }, reject);
      });
    });
  }

  /**
   * Resolves Paper[]
   */
  parseFile(filePath) {
    return new Promise((resolve, reject) => {
      const parseLines = [];

      const lineReader = readline.createInterface({
        input: fs.createReadStream(filePath)
      });

      lineReader.on("line", line => {
        parseLines.push(parseLine(line).then(this.generateHandleEvent("onLineParsed")));
      });

      lineReader.on("close", () => {
        Promise.all(parseLines).then(papers => {
          resolve(papers);
        });
      });
    });
  }
}

module.exports = Parser;
