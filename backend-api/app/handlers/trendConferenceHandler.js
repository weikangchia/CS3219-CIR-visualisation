const commonErrorResponse = require("../common").errorResponse;

let db;
let logger;

const handlerName = "trendConferenceHandler";

async function getPapers(pipeStages) {
  const Paper = db.model("Paper");

  return new Promise((resolve, reject) => {
    Paper.aggregate(pipeStages, (err, result) => {
      resolve(result);
    });
  });
}

async function getConferenceTrends(name, minYear, maxYear) {
  const matchStage = {
    $match: {
      venue: name,
      year: {
        $gte: minYear,
        $lte: maxYear
      }
    }
  };

  const groupStage = {
    $group: {
      _id: "$year",
      count: {
        $sum: 1
      }
    }
  };

  const sortStage = {
    $sort: {
      _id: 1
    }
  };

  const projectStage = {
    $project: {
      _id: 0,
      year: "$_id",
      count: 1
    }
  };

  const groupResult = await getPapers([matchStage, groupStage, sortStage, projectStage]);

  let currentIndex = 0;

  for (let year = minYear; year <= maxYear; year++) {
    if (groupResult[currentIndex] === undefined || groupResult[currentIndex].year !== year) {
      groupResult.push({
        year,
        count: 0
      });
    } else {
      currentIndex++;
    }
  }

  return groupResult;
}

function handler(options) {
  ({
    logger,
    db
  } = options);

  return (req, res) => {
    const params = req.query;

    if (!("name" in params)) {
      res.status(400).send(JSON.stringify(commonErrorResponse.invalidField));
    }

    const name = params.name.trim();
    const minYear = parseInt(params.minYear, 10) || 1800;
    const maxYear = parseInt(params.maxYear, 10) || 1800;

    logger.info({
      handler: handlerName,
      name,
      minYear,
      maxYear
    });

    getConferenceTrends(name, minYear, maxYear).then(result => {
      res.status(200).send(JSON.stringify(result));
    });
  };
}

module.exports = handler;
