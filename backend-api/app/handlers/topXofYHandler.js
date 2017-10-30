/**
 * Returns the topN authors.
 *
 * @param {integer} topN number of authors (default is 10)
 */
function getTopAuthors(options) {

  return new Promise((resolve, reject) => {
    options = options || {};
    const topN = options.topN || 10;

    y = options.y;
    value = options.value;
    var filterY = {};
    filterY[y] = value;

    var topAuthors = {};
    var authorsObjArr = {};
    var paperObj = {};

    db.find(filterY, function (err, papers) {
      if (err) return logger.info(err);
      papers.forEach(function (element) {
        paperObj['title'] = element.title;
        paperObj['authors'] = element.authors;
        paperObj['venue'] = element.venue;
        paperObj['inCitations'] = element.inCitations;
        paperObj['outCitations'] = element.outCitations;
        paperObj['year'] = element.year;
        paperObj['abstract'] = element.abstract;
        paperObj['keyPhrases'] = element.keyPhrases;
        element.authors.forEach(authorObj => {
          id = authorObj.ids[0];
          topAuthors[id] = topAuthors[id] || [];
          topAuthors[id].push(paperObj);
          authorsObjArr[id] = authorObj;
        }, this);
      }
      );

      topAuthors = Object.keys(topAuthors)
        .sort((author1, author2) =>
          topAuthors[author2].length - topAuthors[author1].length)
        .slice(0, topN)
        .map(authorId => {
          return {
            author: authorsObjArr[authorId],
            count: topAuthors[authorId].length,
            papers: topAuthors[authorId]
          };

        });
      resolve(topAuthors);
    });
  });
}

module.exports = function (options) {
  logger = options.logger
  papersController = options.papersController
  db = options.db

  return (req, res) => {
    const params = req.query;

    const options = {};
    const paperFilters = [];

    if (params.y && params.value) {
      options.y = params.y;
      options.value = params.value;
    }

    if (params.topN) {
      options.topN = params.topN;
    }

    if (paperFilters.length > 0) {
      options.paperFilter = paper =>
        paperFilters.every(paperFilter => paperFilter(paper));
    }

    getTopAuthors(options).then(result => res.send(JSON.stringify(result)));
  }

}
