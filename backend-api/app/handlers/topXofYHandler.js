let logger;
let db;

/**
 * Returns appropriate select depending on x.
 * Default is paper if x empty.
 *
 * @param {string} x domain
 */
function getSelect(x) {
  let toReturn = "";
  if (x === "author") {
    toReturn = "authors";
  } else if (x === "venue") {
    toReturn = "venue";
  } else if (x === "keyphrase") {
    toReturn = "keyPhrases";
  } else if (x === "year") {
    toReturn = "year";
  } else {
    // default is paper
    toReturn = "id title authors venue inCitations outCitations year abstract keyPhrases";
  }
  return toReturn;
}

/**
 * Returns appropriate filter depending on Y.
 * Returns empty filter if either y or value is missing.
 *
 * @param {string} params.y range
 * @param {string} params.value for y
 */
function getFilter(params) {
  const filterY = {};
  let y;
  let value;

  if (!params.y || !params.value) {
    return filterY;
  }

  if (params.y === "author") {
    y = "authors.name";
    ({
      value
    } = params);
  } else if (params.y === "keyphrase") {
    y = "keyPhrases";
    ({
      value
    } = params);
  } else if (params.y === "paper") {
    y = "title";
    ({
      value
    } = params);
  } else {
    // venue, year and invalid
    ({
      y,
      value
    } = params);
  }

  filterY[y] = value;
  return filterY;
}

/**
 * Returns appropriate key object for paper depending on X
 *
 * @param {object} paper
 * @param {string} x domain (default is paper)
 */
function getGroupKeys(paper, x) {
  const keys = [];

  // paper must have an id
  if (paper.id === "") {
    return keys;
  }

  if (x === "author") {
    paper.authors.forEach(author => {
      if (author.ids.length !== 0) {
        const key = {};
        [key.id] = author.ids;
        key.obj = author;
        key.count = 1;
        keys.push(key);
      }
    }, this);
  } else if (x === "venue") {
    if (paper.venue && (!paper.venue.trim || paper.venue.trim() !== "")) {
      const key = {};
      key.id = paper.venue;
      key.obj = {
        venue: paper.venue
      };
      key.count = 1;
      keys.push(key);
    }
  } else if (x === "keyphrase") {
    paper.keyPhrases.forEach(keyPhrase => {
      const key = {};
      key.id = keyPhrase;
      key.obj = {
        keyPhrase
      };
      key.count = 1;
      keys.push(key);
    }, this);
  } else if (x === "year") {
    if (paper.year && (!paper.year.trim || paper.year.trim() !== "")) {
      const key = {};
      key.id = paper.year;
      key.obj = {
        year: paper.year
      };
      key.count = 1;
      keys.push(key);
    }
  } else {
    // default is paper
    const paperObj = {};
    paperObj.title = paper.title;
    paperObj.authors = paper.authors;
    paperObj.venue = paper.venue;
    paperObj.inCitations = paper.inCitations;
    paperObj.outCitations = paper.outCitations;
    paperObj.year = paper.year;
    paperObj.abstract = paper.abstract;
    paperObj.keyPhrases = paper.keyPhrases;

    const key = {};
    key.id = paper.id;
    key.obj = paperObj;
    key.count = paper.inCitations.length;
    keys.push(key);
  }
  return keys;
}

function sanitizeXorY(xOrY){
  if(xOrY === 'authors'){
    xOrY = 'author';
  } else if(xOrY === 'venues'){
    xOrY = 'venue';
  }
  return xOrY
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
    let x = params.x || "paper";
    
    x = sanitizeXorY(x);
    params.y = sanitizeXorY(params.y);

    const filterY = getFilter(params);
    const select = getSelect(x);

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
            topX[id] = Number(topX[id]) + Number(key.count);
            xObjArr[id] = key.obj;
          }, this);
        });

        topX = Object.keys(topX)
          .sort((x1, x2) =>
            topX[x2] - topX[x1])
          .slice(0, topN)
          .map(id => {
            return {
              x: xObjArr[id],
              count: topX[id]
            };
          });

        resolve(topX);
      }
    }).select(select)
      .lean();
  });
}

function handler(options) {
  ({
    logger,
    db
  } = options);

  return (req, res) => {
    const params = req.query;

    getTopXofY(params).then(result => res.send(JSON.stringify({
      topN: params.topN,
      x: params.x,
      y: params.y,
      value: params.value,
      results: result
    })));
  };
}

module.exports = handler;
