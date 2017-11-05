/**
 * Returns appropiate key object for paper depending on X
 *
 * @param {object} paper
 * @param {string} x domain(default is paper)
 */
function getGroupKeys(paper, x) {
  const keys = [];
  const paperObj = {};
  paperObj.title = paper.title;
  paperObj.authors = paper.authors;
  paperObj.venue = paper.venue;
  paperObj.inCitations = paper.inCitations;
  paperObj.outCitations = paper.outCitations;
  paperObj.year = paper.year;
  paperObj.abstract = paper.abstract;
  paperObj.keyPhrases = paper.keyPhrases;

  if (x === "author") {
    paper.authors.forEach(author => {
      const key = {};
      [key.id] = author.ids;
      key.obj = author;
      key.count = [paperObj];
      keys.push(key);
    }, this);
  } else if (x === "venue") {
    const key = {};
    key.id = paper.venue;
    key.obj = { venue: paper.venue };
    key.count = [paperObj];
    keys.push(key);
  } else if (x === "keyphrase") {
    paper.keyPhrases.forEach(keyPhrase => {
      const key = {};
      key.id = keyPhrase;
      key.obj = { keyPhrase: keyPhrase };
      key.count = [paperObj];
      keys.push(key);
    }, this);
  } else if (x === "year") {
    const key = {};
    key.id = paper.year;
    key.obj = { year: paper.year };
    key.count = [paperObj];
    keys.push(key);
  } else {
    // default is paper
    const key = {};
    key.id = paper.id;
    key.obj = paperObj;
    key.count = paper.inCitations || [];
    keys.push(key);
  }
  return keys;
}

/**
 * Returns the topN x of y.
 *
 * @param {integer} topN number of x (default is 10)
 * @param {string} x domain(default is paper)
 * @param {string} y range
 * @param {string} value of y
 */
function getTopXofY(options) {
  return new Promise((resolve, reject) => {
    options = options || {};
    const topN = options.topN || 10;
    const x = options.x || "paper";

    const filterY = {};
    if (options.y && options.value) {
      y = options.y;
      value = options.value;
      filterY[y] = value;
    }

    let topX = {};
    const xObjArr = {};

    Paper.find(filterY, function (err, papers) {
      if (err) return logger.info(err);
      papers.forEach(function (element) {
        const groupKeys = getGroupKeys(element, x);
        groupKeys.forEach(key => {
          const id = key.id;
          topX[id] = topX[id] || [];
          topX[id].push(...key.count);
          xObjArr[id] = key.obj;
        }, this);
      }
      );

      topX = Object.keys(topX)
        .sort((x1, x2) =>
          topX[x2].length - topX[x1].length)
        .slice(0, topN)
        .map(id => {
          return {
            x: xObjArr[id],
            count: topX[id].length,
            actualObjs: topX[id]
          };
        });
      resolve(topX);
    }).select('title authors venue inCitations outCitations year abstract keyPhrases');

  });
}

module.exports = function (options) {
  logger = options.logger
  papersController = options.papersController
  db = options.db
  Paper = options.models.Paper;

  return (req, res) => {
    const params = req.query;

    const options = {};
    const paperFilters = [];

    if (params.x) {
      options.x = params.x;
    }

    if (params.y && params.value) {
      options.y = params.y;
      options.value = params.value;
    }

    if (params.topN) {
      options.topN = params.topN;
    }

    getTopXofY(options).then(result => res.send(JSON.stringify(result)));
  }
}
