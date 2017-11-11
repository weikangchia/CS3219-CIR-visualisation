let conn = new Mongo();
let db = conn.getDB("CS3219");

var initPromises = [];
if (!db.getCollectionNames().includes("authors")) {
  db.createCollection("authors", { collation: { locale: "en", strength: 2 } });
} else {
}

let cursor = db.papers.aggregate(
  [
    {
      $unwind: "$authors"
    },
    {
      $group: {
        _id: `$authors`
      }
    }
  ],
  {
    allowDiskUse: true
  }
);

let bulk = db.authors.initializeUnorderedBulkOp();

while (cursor.hasNext()) {
  let author = cursor.next()._id;
  author.ids = author.ids.length === 0 ? [author.name] : author.ids;
  author.ids.forEach(id => {
    let authorObj = {
      id,
      name: author.name
    };
    bulk
      .find({ id })
      .upsert()
      .updateOne(authorObj);
  });
}

printjson("Bulk Execute");
printjson(bulk.execute());
