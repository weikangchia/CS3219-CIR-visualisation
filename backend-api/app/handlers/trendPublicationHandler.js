function handler(options) {
  return (req, res) => {
    const {
      logger,
      db
    } = options;

    logger.info("Retrieving publication trend from database");

    const Paper = db.model("Paper");

    const params = req.query;
    const venue = params.venue.trim() || "";
    const minYear = parseInt(params.minYear, 10) || 1800;
    const maxYear = parseInt(params.maxYear, 10) || 1800;

    const matchStage = {
      $match: {
        venue,
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

    Paper.aggregate([matchStage, groupStage, sortStage, projectStage], (err, groupResult) => {
      let currentIndex = 0;

      for (let year = minYear; year <= maxYear; year++) {
        if (groupResult[currentIndex].year !== year) {
          groupResult.push({
            year,
            count: 0
          });
        } else {
          currentIndex++;
        }
      }

      res.send(JSON.stringify(groupResult));
    });
  };
}

module.exports = handler;
