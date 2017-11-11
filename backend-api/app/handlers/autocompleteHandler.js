module.exports = options => {
  const {
    logger,
    db
  } = options;

  const domains = {
    venue: {
      groupBy: "venue"
    },
    author: {
      groupBy: "authors.name",
      unwind: {
        $unwind: "$authors"
      }
    },
    keyphrase: {
      unwind: {
        $unwind: "$keyPhrases"
      },
      groupBy: "keyPhrases"
    },
    paper: {
      groupBy: "title"
    },
    year: {
      groupBy: "year",
      project: {
        $project: {
          year: {
            $substr: ["$year", 0, 4]
          }
        }
      }
    }
  };

  const validDomains = Object.keys(domains);

  function autocomplete(params) {
    return new Promise((resolve, reject) => {
      let match;
      const {
        domain,
        search
      } = params;

      const {
        groupBy,
        unwind,
        getMatch,
        project
      } = domains[domain];

      if (getMatch) {
        match = getMatch(params);
      } else {
        match = {};

        match[groupBy] = {
          $regex: new RegExp(`^${search}`, "i")
        };
      }

      const group = {
        _id: `$${groupBy}`
      };

      const pipeline = [];

      if (project) {
        pipeline.push(project);
      }

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
            _id: 1
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
    let {
      domain
    } = params;

    params.limit = params.topN || 5;

    if (!params.search) {
      return res.status(404).send("INVALID_SEARCH_VALUE");
    }

    if (validDomains.indexOf(domain) >= 0) {
      return autocomplete(({
        domain,
        topN: limit = 5,
        search
      } = params)).then(results => {
        res.send(JSON.stringify(results));
      });
    }

    return res.status(404).send("INVALID_DOMAIN");
  };
};
