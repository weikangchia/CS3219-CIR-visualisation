function getTopXofY(options, getGroupKeys) {
  return new Promise((resolve, reject) => {
    options = options || {};
    const topN = options.topN || 10;

    y = options.y;
    value = options.value;
    var filterY = {};
    filterY[y] = value;

    var topPapers = {};
    //   var inCites = {};
    var paperObj = {};

    Paper.find(filterY, function (err, papers) {
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
        //inCites[element.id] = paperObj;
        topPapers[element.id] = paperObj;
        //   logger.info(topPapers[element.id]['inCitations']);
        /* 
        element.authors.forEach(authorObj => {
          id = authorObj.ids[0];
          topAuthors[id] = topAuthors[id] || [];
          topAuthors[id].push(paperObj);
          paperObjArr[id] = authorObj;
        }, this);*/
        groupKeys = getGroupKeys(paper);
        groupKeys.forEach((id) => {

        })
      }
      );

      topPapers = Object.keys(topPapers)
        .sort((paper1, paper2) => {
          logger.info(paper2);
          topPapers[paper2.id]['inCitations'].length - topPapers[paper1.id]['inCitations'].length;
        })
        .slice(0, topN);
      /*
            topPapers.forEach(paper =>
              paper.setInCitations(paper.getInCitations().map(inCitationId => {
                return papersDict[inCitationId] || inCitationId;
              })));
      */
      resolve(topPapers);
    });

  });
}

/**
 * Returns the topN papers.
 *
 * @param {integer} topN number of papers (default is 10)
 */
function getTopPapers(options) {

  getGroupKeys = function (paper) {
    return [paper.inCitations.length]
  }
  topPapers = getTopNXofY(getGroupKeys);

}

function getGroupKeys(paper, x, paperObj) {
  keys = [];
  if (x == "author") {
    paper.authors.forEach(author => {
      key = {};
      key.id = author.ids[0];
      key.obj = author;
      key.count = paperObj;
      keys.push(key);
    }, this);

  } else if (x == "venue") {
    key = {};
    key.id = paper.venue;
    key.obj = { 'venue': paper.venue };
    key.count = paperObj;
    keys.push(key);

  } else if (x == "keyphrase") {
    paper.keyPhrases.forEach(keyPhrase => {
      key = {};
      key.id = keyPhrase;
      key.obj = { 'keyPhrase': keyPhrase };
      key.count = paperObj;
      keys.push(key);
    }, this);

  } else if (x == "year") {
    key = {};
    key.id = paper.year;
    key.obj = { 'year': paper.year };
    key.count = paperObj;
    keys.push(key);
  } else {
    //default is paper

    key = {};
    key.id = paper.id;
    key.obj = paperObj;
    key.count = paperObj.inCitations;
    keys.push(key);
  }
  return keys;
}

/**
 * Returns the topN authors.
 *
 * @param {integer} topN number of authors (default is 10)
 */
function getTopAuthors(options, x) {

  return new Promise((resolve, reject) => {
    options = options || {};
    const topN = options.topN || 10;

    y = options.y;
    value = options.value;
    var filterY = {};
    filterY[y] = value;

    var topX = {};
    var xObjArr = {};
    var paperObj = {};

    Paper.find(filterY, function (err, papers) {
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
        groupKeys = getGroupKeys(element, x, paperObj);
        groupKeys.forEach(key => {
          id = key.id;
          topX[id] = topX[id] || [];
          topX[id].push(key.count);
          xObjArr[id] = key.obj;
        }, this);
      }
      );

      topX = Object.keys(topX)
        .sort((x1, x2) =>
          topX[x2].length - topX[x1].length)
        .slice(0, topN)
        .map(id => {
          return {
            x: xObjArr[id],
            count: topX[id].length,
            papers: topX[id]
          };

        });
      resolve(topX);
    });

  });
}

module.exports = function (options) {
  logger = options.logger
  papersController = options.papersController
  db = options.db
  Paper = options.models.Paper;

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

    getTopAuthors(options, params.x).then(result => res.send(JSON.stringify(result)));
    /*
        if (params.x == "author") {
          getTopAuthors(options).then(result => res.send(JSON.stringify(result)));
        } else if (params.x == "paper") {
          getTopPapers(options).then(result => res.send(JSON.stringify(result)));
    
        }
    */
  }
}
