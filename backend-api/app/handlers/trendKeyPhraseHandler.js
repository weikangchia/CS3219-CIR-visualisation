const commonErrorResponse = require("../common").errorResponse;

let db;
let logger;

async function getPapers(filter, projection) {
  const Paper = db.model("Paper");

  return new Promise((resolve, reject) => {
    Paper.find(filter, projection, (err, result) => {
      resolve(result);
    });
  });
}

async function getKeyphraseTrends(phrase, minYear, maxYear) {
  const filter = {
    keyPhrases: {
      $in: [phrase]
    },
    year: {
      $gte: minYear,
      $lte: maxYear
    }
  };

  const projection = {
    year: 1
  };

  const papers = await getPapers(filter, projection);

  const yearCountArr = {};
  const groupResult = [];

  // initialize all year
  for (let year = minYear; year <= maxYear; year++) {
    yearCountArr[year] = 0;
  }

  papers.forEach(paper => {
    yearCountArr[paper.year]++;
  });

  Object.keys(yearCountArr).forEach(year => {
    groupResult.push({
      year,
      count: yearCountArr[year]
    });
  });

  return groupResult;
}

function handler(options) {
  ({
    logger,
    db
  } = options);

  return (req, res) => {
    logger.info("Retrieving keyphrase trend from database");

    const params = req.query;

    if (!("phrase" in params)) {
      res.status(400).send(JSON.stringify(commonErrorResponse.invalidField));
    }

    const phrase = params.phrase.trim();
    const minYear = parseInt(params.minYear, 10) || 1800;
    const maxYear = parseInt(params.maxYear, 10) || 1800;

    getKeyphraseTrends(phrase, minYear, maxYear).then(result => {
      res.status(200).send(JSON.stringify(result));
    });
  };
}

module.exports = handler;
