let logger;
let db;

const selects = {
  author: "authors",
  venue: "venue",
  keyphrase: "keyPhrases",
  year: "year",
  paper:
  "id title authors venue inCitations outCitations year abstract keyPhrases"
};

const entities = {
  author: {
    select: selects.author,
    getGroupKeys: function (paper) {
      const keys = [];
      paper.authors.forEach(author => {
        if (author.ids.length !== 0) {
          keys.push({
            id: author.ids[0],
            obj: author,
            count: 1
          });
        } 
      }, this);
      return keys;
    },
    getFilter: function (y, value) {
      if (y && value) {
        return {
          'authors.name': value
        };
      }
      return {};
    }
  },
  venue: {
    select: selects.venue,
    getGroupKeys: function (paper) {
      if (paper.venue && (!paper.venue.trim || paper.venue.trim() !== "")) {
        return [{
          id: paper.venue,
          obj: {
            venue: paper.venue
          },
          count: 1
        }];
      }
      return [];
    },
    getFilter: function (y, value) {
      const filterY = {};
      if (y && value) {
        filterY[y] = value;
      }
      return filterY;
    }
  },
  keyphrase: {
    select: selects.keyphrase,
    getGroupKeys: function (paper) {
      return paper.keyPhrases.map(keyPhrase => {
        return {
          id: keyPhrase,
          obj: {
            keyPhrase
          },
          count: 1
        };
      }, this);
    },
    getFilter: function (y, value) {
      if (y && value) {
        return { keyPhrases: value };
      }
      return {};
    }
  },
  year: {
    select: selects.year,
    getGroupKeys: function (paper) {
      if (paper.year && (!paper.year.trim || paper.year.trim() !== "")) {
        return [{
          id: paper.year,
          obj: {
            year: paper.year
          },
          count: 1
        }];
      }
      return [];
    },
    getFilter: function (y, value) {
      const filterY = {};
      if (y && value && !isNaN(value)) {
        filterY[y] = value;
      }
      return filterY;
    }
  },
  paper: {
    select: selects.paper,
    getGroupKeys: function (paper) {
      const paperObj = {
        title: paper.title,
        authors: paper.authors,
        venue: paper.venue,
        inCitations: paper.inCitations,
        outCitations: paper.outCitations,
        year: paper.year,
        abstract: paper.abstract,
        keyPhrases: paper.keyPhrases
      }

      const key = {
        id: paper.id,
        obj: paperObj,
        count: paper.inCitations.length
      }
      return [key];
    },
    getFilter: function (y, value) {
      if (y && value) {
        return { title: value }
      }
      return {};
    }
  }
}

function sanitizeXorY(xOrY) {
  if (xOrY === "authors") {
    xOrY = "author";
  } else if (xOrY === "venues") {
    xOrY = "venue";
  }
  return xOrY;
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
    const y = sanitizeXorY(params.y);

    let filterY = {};
    if (entities[y]) {
      const getFilter = entities[y].getFilter;
      filterY = getFilter(y, params.value);
    }

    let select = "";
    let getGroupKeys;
    if (entities[x]) {
      select = entities[x].select;
      getGroupKeys = entities[x].getGroupKeys;
    } else {
      select = entities.paper.select;
      getGroupKeys = entities.paper.getGroupKeys;
    }

    let topX = {};
    const xObjArr = {};

    const Paper = db.model("Paper");

    Paper.find(filterY, (err, papers) => {
      if (err) {
        logger.info(err);
      } else {
        logger.info(`${papers.length} results from DB found.`);
        papers.forEach(element => {
          const groupKeys = getGroupKeys(element);
          groupKeys.forEach(key => {
            const { id } = key;
            topX[id] = topX[id] || [];
            topX[id] = Number(topX[id]) + Number(key.count);
            xObjArr[id] = key.obj;
          }, this);
        });

        topX = Object.keys(topX)
          .sort((x1, x2) => topX[x2] - topX[x1])
          .slice(0, topN)
          .map(id => {
            return {
              x: xObjArr[id],
              count: topX[id]
            };
          })
          .filter(d => d.count !== 0);

        resolve(topX);
      }
    })
      .select(select)
      .lean();
  });
}

function handler(options) {
  ({ logger, db } = options);

  return (req, res) => {
    const params = req.query;

    getTopXofY(params).then(result => {
      const send = {
        topN: params.topN,
        x: params.x,
        y: params.y,
        value: params.value,
        results: result
      };
      res.send(JSON.stringify(send));
    });
  };
}

module.exports = handler;
