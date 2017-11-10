module.exports = options => {
  const { logger, db } = options;

  const validDomains = ["venues", "authors", "keyphrases"];

  function autocomplete(params) {
    return new Promise((resolve, reject) => {
      let groupBy;
      let unwind;
      const match = {};
      const { domain, search } = params;

      if (domain === "authors") {
        groupBy = "authors.name";

        unwind = {
          $unwind: "$authors"
        };
      } else if (domain === "venues") {
        groupBy = "venue";
      }else if (domain === "keyphrases"){
        unwind = {
          $unwind: "$keyPhrases"
        };
        groupBy = "keyPhrases"
      }

      match[groupBy] = {
        $regex: new RegExp(`^${search}`, "i")
      };

      const group = { _id: `$${groupBy}` };

      const pipeline = [];

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
        return resolve(results.map(result => result._id));
      });
    });
  }

  return (req, res) => {
    logger.info("Retrieving autocomplete search from database");

    const params = req.query;
    let { domain } = params;
    let limit;

    params.limit = params.topN || 5;

    if (!params.search) {
      return res.status(404).send("INVALID_SEARCH_VALUE");
    }

    if (validDomains.indexOf(domain) >= 0) {
      return autocomplete(
        ({ domain, topN: limit = 5, search } = params)
      ).then(results => {
        res.send(JSON.stringify(results));
      });
    }
    return res.status(404).send("INVALID_DOMAIN");
  };
};
