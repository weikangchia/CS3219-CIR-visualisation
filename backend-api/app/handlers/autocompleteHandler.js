module.exports = options => {
  const { logger, db } = options;

  const validDomains = ["venue", "authors"];

  function autocomplete(params) {
    return new Promise((resolve, reject) => {
      var unwind;
      var domain = params.domain;
      var search = params.search;

      if (domain == "authors") {
        domain = "authors.name";

        unwind = {
          $unwind: "$authors"
        };
      }

      match = {};

      match[domain] = {
        $regex: RegExp(`^${search}`, "i")
      };

      group = { _id: `$${domain}` };

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

      // console.log(JSON.stringify(pipeline, null, 4));
      db.model("Paper").aggregate(pipeline, (err, results)=>{
        if(err) return reject(err);
        resolve(results.map(result => result["_id"]))
      });
    });
  }

  return (req, res) => {
    logger.info("Retrieving autocomplete search from database");

    const Paper = db.model("Paper");

    const params = req.query;
    const domain = params.domain;

    if (validDomains.indexOf(domain) >= 0) {
      autocomplete({
        domain: params.domain,
        limit: params.limit || 5,
        search: params.search
      }).then((results) => {
        console.log(results)
        res.send(JSON.stringify(results));
      });
    } else {
      res.send(new Error("INVALID_DOMAIN"));
    }
  };
};
