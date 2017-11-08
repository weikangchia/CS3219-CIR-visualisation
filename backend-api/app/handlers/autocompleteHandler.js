"use strict";

module.exports = options => {
  const { logger, db } = options;

  const validDomains = ["venues", "authors"];

  function autocomplete(params) {
    return new Promise((resolve, reject) => {
      let unwind,
        group,
        groupBy,
        pipeline,
        match = {};
      let { domain, search } = params;

      if (domain === "authors") {
        groupBy = "authors.name";

        unwind = {
          $unwind: "$authors"
        };
      }

      if (domain === "venues") {
        groupBy = "venue";
      }

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
        return resolve(results.map(result => result["_id"]));
      });
    });
  }

  return (req, res) => {
    logger.info("Retrieving autocomplete search from database");

    const params = req.query;
    const domain = params.domain;

    if (!params.search) {
      return res.status(404).send("INVALID_SEARCH_VALUE");
    }

    if (validDomains.indexOf(domain) >= 0) {
      autocomplete(({ domain, limit = 5, search } = params)).then(results => {
        res.send(JSON.stringify(results));
      });
    } else {
      res.status(404).send("INVALID_DOMAIN");
    }
  };
};
