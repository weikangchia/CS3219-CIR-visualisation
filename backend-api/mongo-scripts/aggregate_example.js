let conn = new Mongo();
let db = conn.getDB("CS3219");

let cursor = db.papers.aggregate([
  {
    $unwind: "$authors"
  },
  {
    $match: {
      "authors.name": {
        $regex: new RegExp("^")
      },
      "year" : 2016
    }
  },
  {
    $group: {
      _id: `$authors.name`,
      total: { $sum: 1 }
    }
  },
  {
    $sort: {
      total: -1
    }
  },
  {
    $limit: 5
  }
]);

printjson(cursor.toArray());
