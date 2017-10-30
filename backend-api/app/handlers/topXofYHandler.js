
/**
 * Returns the topN authors.
 *
 * @param {integer} topN number of authors (default is 10)
 */
function getTopAuthors(options) {
    options = options || {};
    const topN = options.topN || 10;
  
    const authors = papersController.getAuthorsObject();
    let topAuthors = papersController.group({
      groupsFromPaper: paper =>
        paper.getAuthors().map(author => author.getId() || author.getName()),
      paperFilter: options.paperFilter
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
  
module.exports = function(options){
    logger = options.logger
    papersController = options.papersController
    db = options.db

    return (req, res) => {
      db.find({ 'venue': 'icse' }, 'title year',function (err, papers) {
        if (err) return logger.info(err);
        papers.forEach(function(element) {          
        logger.info(element.title);
        }, this);
      })
      const params = req.query;
    
      const options = {};
      const paperFilters = [];
    
      if (params.venue) {
        paperFilters.push(paper => paper.getVenue().toLowerCase() === params.venue.toLowerCase());
      }
    
      if (params.topN) {
        options.topN = params.topN;
      }
    
      if (paperFilters.length > 0) {
        options.paperFilter = paper =>
          paperFilters.every(paperFilter => paperFilter(paper));
      }
    
      res.send(JSON.stringify(getTopAuthors(options)));
    }
     
  }
  