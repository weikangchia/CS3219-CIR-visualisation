function handler(options) {
  return (req, res) => {
    const {
      logger,
      db
    } = options;

    logger.info("Retrieving keyphrase trend from database");

    const Paper = db.model("Paper");

    const params = req.query;
    const phrase = params.phrase.trim() || "";
    const minYear = parseInt(params.minYear, 10) || 1800;
    const maxYear = parseInt(params.maxYear, 10) || 1800;

    Paper.find({
      keyPhrases: {
        $in: [phrase]
      },
      year: {
        $gte: minYear,
        $lte: maxYear
      }
    }, {
      year: 1
    }, (err, result) => {
      const yearCountArr = {};
      const groupResult = [];

      // initialize all year
      for (let year = minYear; year <= maxYear; year++) {
        yearCountArr[year] = 0;
      }

      result.forEach(paper => {
        yearCountArr[paper.year]++;
      });

      Object.keys(yearCountArr).forEach(year => {
        groupResult.push({
          year,
          count: yearCountArr[year]
        });
      });

      res.send(JSON.stringify(groupResult));
    });
  };
}

module.exports = handler;
