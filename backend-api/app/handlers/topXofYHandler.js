let logger;
let db;

/**
 * Returns appropriate key object for paper depending on X
 *
 * @param {object} paper
 * @param {string} x domain (default is paper)
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
    key.obj = {
      venue: paper.venue
    };
    key.count = [paperObj];
    keys.push(key);
  } else if (x === "keyphrase") {
    paper.keyPhrases.forEach(keyPhrase => {
      const key = {};
      key.id = keyPhrase;
      key.obj = {
        keyPhrase
      };
      key.count = [paperObj];
      keys.push(key);
    }, this);
  } else if (x === "year") {
    const key = {};
    key.id = paper.year;
    key.obj = {
      year: paper.year
    };
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
 * @param {string} x domain (default is paper)
 * @param {string} y range
 * @param {string} value of y
 */
function getTopXofY(params) {
  return new Promise((resolve, reject) => {
    params = params || {};
    const topN = params.topN || 10;
    const x = params.x || "paper";

    const filterY = {};
    let y;
    let value;
    if (params.y && params.value) {
      ({
        y,
        value
      } = params);

      filterY[y] = value;
    }

    let topX = {};
    const xObjArr = {};

    const Paper = db.model("Paper");

    Paper.find(filterY, (err, papers) => {
      if (err) {
        logger.info(err);
      } else {
        logger.info(`${papers.length} results from DB found.`);
        papers.forEach(function (element) {
          const groupKeys = getGroupKeys(element, x);
          groupKeys.forEach(key => {
            const {
              id
            } = key;
            topX[id] = topX[id] || [];
            topX[id].push(...key.count);
            xObjArr[id] = key.obj;
          }, this);
        });

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
      }
    }).select('title authors venue inCitations outCitations year abstract keyPhrases');
  });
}

function handler(options) {
  ({
    logger,
    db
  } = options);

  return (req, res) => {
    const params = req.query;

    getTopXofY(params).then(result => res.send(JSON.stringify(result)));
  };
}

module.exports = handler;
