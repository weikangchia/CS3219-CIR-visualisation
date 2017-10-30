module.exports = function(options){
  logger = options.logger
  return (req, res) => {
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
