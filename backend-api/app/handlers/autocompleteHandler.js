const commonErrorResponse = require("../common").errorResponse;

/**
 * Handler for autocomplete API.
 */

const handlerName = "autocompleteHandler";

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
        search,
        limit
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
          $limit: limit
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
    const params = req.query;
    const {
      domain,
      limit
    } = params;

    params.limit = parseInt(limit, 10) || 5;

    if (!params.search) {
      return res.status(400).send(JSON.stringify(commonErrorResponse.invalidField));
    }

    logger.info({
      handler: handlerName,
      search: params.search
    });

    if (validDomains.indexOf(domain) >= 0) {
      return autocomplete(params).then(results => {
        res.send(JSON.stringify(results));
      });
    }

    return res.status(400).send(JSON.stringify(commonErrorResponse.invalidDomain));
  };
};
