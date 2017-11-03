/**
 * Returns the topN authors.
 *
 * @param {integer} topN number of authors (default is 10)
 */
function getTopAuthors(paperOptions, papersController) {
  paperOptions = paperOptions || {};
  const topN = paperOptions.topN || 10;

  const authors = papersController.getAuthorsObject();
  let topAuthors = papersController.group({
    groupsFromPaper: paper =>
      paper.getAuthors().map(author => author.getId() || author.getName()),
    paperFilter: paperOptions.paperFilter
  });

  topAuthors = Object.keys(topAuthors)
    .sort((author1, author2) =>
      topAuthors[author2].length - topAuthors[author1].length)
    .slice(0, topN)
    .map(authorId => {
      return {
        author: authors[authorId],
        count: topAuthors[authorId].length,
        papers: topAuthors[authorId]
      };
    });

  return topAuthors;
}

module.exports = function (options) {
  return (req, res) => {
    const params = req.query;

    const paperOptions = {};
    const paperFilters = [];

    if (params.venue) {
      paperFilters.push(paper => paper.getVenue().toLowerCase() === params.venue.toLowerCase());
    }

    if (params.topN) {
      paperOptions.topN = params.topN;
    }

    if (paperFilters.length > 0) {
      paperOptions.paperFilter = paper =>
        paperFilters.every(paperFilter => paperFilter(paper));
    }

    res.send(JSON.stringify(getTopAuthors(paperOptions, options.papersController)));
  };
};
