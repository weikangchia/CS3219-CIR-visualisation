/**
 * Returns co-Authors Information
 *
 * @param {*, function} options, callback function
 */
async function getCoAuthorsGraph(options, callback) {
  const nodes = [];
  const links = [];
  const set = new Set();
  const setPapers = new Set();

  function minimizeAuthor(author, paper, level) {
    const authorObj = paper.authors.find(authorObject => authorObject.ids[0] === author);
    return {
      id: author,
      level,
      author: authorObj ? authorObj.name : "undefined",
      title: paper.title ? paper.title : "undefined"
    };
  }

  function findAuthorId(paper, authorName) {
    const authors = paper.authors;
    var authorId = undefined;
    authors.forEach(author => {
      if(author.name === authorName) {
        authorId = author.ids[0] ? author.ids[0] : undefined;
      }
    });
    return authorId;
  }

  async function getPapersFromAuthorName(authorName) {
    return new Promise((resolve, reject) => {
      Paper.find({
        "authors.name": authorName
      }, (err, result) => {
        resolve(result);
      });
    })
  }

  async function dig(curLevel, maxLevel, source) {
    const papers = await getPapersFromAuthorName(source);

    if(papers === null) {
      logger.info("No Papers found with author's Name " + options.author);
    } else {
      await Promise.all(papers.map(async paper => {
            // logger.info(paper.title);
            // logger.info(paper.authors);
        await findAuthorsFromPaper(paper, source, curLevel, maxLevel);
      }));
    }
  }

  async function findAuthorsFromPaper(paper, author, curLevel, maxLevel) {
    if(curLevel < maxLevel && paper !== undefined && !setPapers.has(paper._id.toString())) {
      setPapers.add(paper._id.toString());
      const authorId = findAuthorId(paper, author);
      if(!set.has(authorId) && authorId !== undefined) {
        nodes.push(minimizeAuthor(authorId, paper, curLevel));
        set.add(authorId);
      }
      const authors = paper.authors;
      //logger.info("Authors: " + authors);
      if(authorId !== undefined) {
        await Promise.all(authors.map(async author => {
          coAuthorId = author.ids[0] ? author.ids[0] : undefined;
          if(coAuthorId !== undefined) {
            if(!set.has(coAuthorId)) {
              nodes.push(minimizeAuthor(coAuthorId, paper, curLevel + 1));
              set.add(coAuthorId);
            }
            if(coAuthorId !== authorId){
              links.push({
                source: author.ids[0],
                target: authorId
              })
              // logger.info(paper.title);
              // logger.info("Source: " + author.ids[0] + " " + "Target: " + authorId);
              if((curLevel+1) < maxLevel) {
                await dig(curLevel + 1, maxLevel, author.name);
              }
            }
          }
        }));
      }
    }
  }

  options = options || {};
  options.levels = options.levels || 3;
  options.author = options.author || "";

  const papers = await getPapersFromAuthorName(options.author);

  if(papers === null) {
    logger.info("No Papers found with author's Name " + options.author);
  } else {
    await Promise.all(papers.map(async paper => {
      //logger.info(paper.authors);
      await findAuthorsFromPaper(paper, options.author, 1, options.levels);
    }));
  }

  logger.info(nodes);
  return {
    nodes,
    links
  }
}

module.exports = function(options) {
  const {
    logger,
    db
  } = options;
  return (req, res) => {
    const Paper = db.model("Paper");
    const params = req.query;
    const options = {};
    options.author = params.author;
    options.levels = params.levels;
    options.paper = Paper;

    getCoAuthorsGraph(options).then(result => {
      res.send(JSON.stringify(result));
    })
  };
}
