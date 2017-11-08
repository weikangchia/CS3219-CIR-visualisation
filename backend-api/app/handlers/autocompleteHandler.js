module.exports = options => {
  const { logger, db } = options;

  const validDomains = ["venues", "authors"];

  function autocomplete(params) {
    return new Promise((resolve, reject) => {
      var unwind;
      var domain = params.domain;
      var search = params.search;
      var groupBy;

      if (domain == "authors") {
        groupBy = "authors.name";

        unwind = {
          $unwind: "$authors"
        };
      }

      if (domain == "venues") {
        groupBy = "venue";
      }

      match = {};

      match[groupBy] = {
        $regex: new RegExp(`^${search}`, "i")
      };

      group = { _id: `$${groupBy}` };

      pipeline = [];

      if (unwind) {
        pipeline.push(unwind);
      }

      [
        {
          $match: match
        },
        {
          $group: group
        },
        {
          $sort: {
            _id: -1
          }
        },
        {
          $limit: params.limit
        }
      ].forEach(operation => {
        pipeline.push(operation);
      });

      db.model("Paper").aggregate(pipeline, (err, results) => {
        if (err) return reject(err);
        resolve(results.map(result => result["_id"]));
      });
    });
  }

  return (req, res) => {
    logger.info("Retrieving autocomplete search from database");

    const Paper = db.model("Paper");

    const params = req.query;
    const domain = params.domain;

    if (!params.search) {
      return res.status(404).send("INVALID_SEARCH_VALUE");
    }

    if (validDomains.indexOf(domain) >= 0) {
      autocomplete({
        domain: params.domain,
        limit: params.limit || 5,
        search: params.search
      }).then(results => {
        res.send(JSON.stringify(results));
      });
    } else {
      res.status(404).send("INVALID_DOMAIN");
    }
  };
};
