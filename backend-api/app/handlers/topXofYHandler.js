let logger;
let db;

const selects = {
  author: "authors",
  venue: "venue",
  keyphrase: "keyPhrases",
  year: "year",
  paper: "id title authors venue inCitations outCitations year abstract keyPhrases"
};

const entities = {
  author: {
    select: selects.author,
    getGroupKeys(paper) {
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
    getFilter(y, value) {
      if (y && value) {
        return {
          "authors.name": value
        };
      }
      return {};
    },
    description: "Authors who have written the most number of papers"
  },
  venue: {
    select: selects.venue,
    getGroupKeys(paper) {
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
    getFilter(y, value) {
      const filterY = {};
      if (y && value) {
        filterY[y] = value;
      }
      return filterY;
    },
    description: "Conferences which have the most number of papers published in"
  },
  keyphrase: {
    select: selects.keyphrase,
    getGroupKeys(paper) {
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
    getFilter(y, value) {
      if (y && value) {
        return {
          keyPhrases: value
        };
      }
      return {};
    },
    description: "Keyphrases which are listed in the most number of papers"
  },
  year: {
    select: selects.year,
    getGroupKeys(paper) {
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
    getFilter(y, value) {
      const filterY = {};
      if (y && value && !Number.isNaN(value)) {
        filterY[y] = value;
      }
      return filterY;
    },
    description: "Year with the most number of papers written in"
  },
  paper: {
    select: selects.paper,
    getGroupKeys(paper) {
      const paperObj = {
        title: paper.title,
        authors: paper.authors,
        venue: paper.venue,
        inCitations: paper.inCitations,
        outCitations: paper.outCitations,
        year: paper.year,
        abstract: paper.abstract,
        keyPhrases: paper.keyPhrases
      };

      const key = {
        id: paper.id,
        obj: paperObj,
        count: paper.inCitations.length
      };
      return [key];
    },
    getFilter(y, value) {
      if (y && value) {
        return {
          title: value
        };
      }
      return {};
    },
    description: "Papers which are cited the most"
  }
};

/**
 * Returns the top N x of y.
 *
 * @param {integer} limit number of x (default is 10)
 * @param {string} x domain (default is paper)
 * @param {string} y range
 * @param {string} value of y
 */
function getTopXofY(params) {
  return new Promise((resolve, reject) => {
    params = params || {};
    const {
      x,
      y,
      limit = 10
    } = params;

    let filterY = {};
    if (entities[y]) {
      const {
        getFilter
      } = entities[y];
      filterY = getFilter(y, params.value);
    }

    let select = "";
    let getGroupKeys;
    if (entities[x]) {
      ({
        select,
        getGroupKeys
      } = entities[x]);
    } else {
      ({
        select,
        getGroupKeys
      } = entities.paper);
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
            const {
              id
            } = key;
            topX[id] = topX[id] || [];
            topX[id] = Number(topX[id]) + Number(key.count);
            xObjArr[id] = key.obj;
          }, this);
        });

        topX = Object.keys(topX)
          .sort((x1, x2) => topX[x2] - topX[x1])
          .slice(0, limit)
          .map(id => {
            return {
              x: xObjArr[id],
              count: topX[id]
            };
          })
          .filter(d => d.count !== 0);

        resolve(topX);
      }
    }).select(select).lean();
  });
}

function handler(options) {
  ({
    logger,
    db
  } = options);

  return (req, res) => {
    const params = req.query;
    params.x = params.x || "paper";

    if (!(params.x in entities)) {
      params.x = "paper";
    }

    getTopXofY(params).then(result => {
      const send = {
        limit: params.limit,
        x: params.x,
        y: params.y,
        value: params.value,
        description: entities[params.x].description || "Description",
        results: result
      };
      res.send(JSON.stringify(send));
    });
  };
}

module.exports = handler;
