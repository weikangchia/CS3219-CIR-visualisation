const commonErrorResponse = require("../common").errorResponse;

let logger;
let db;

const handlerName = "graphCoauthorsHandler";

function minimizeAuthor(authorId, authorName, paper, level) {
  // const selectedAuthor = paper.authors.find(author => author.ids[0] === authorId);

  return {
    id: authorId,
    level,
    author: authorName,
    title: paper.title ? paper.title : "undefined"
  };
}

function findAuthorId(paper, authorName) {
  const {
    authors
  } = paper;
  let authorId;

  authors.forEach(author => {
    if (author.name === authorName) {
      authorId = author.ids[0] || author.name;
    }
  });

  return authorId;
}

async function getPapersFromAuthorName(authorName) {
  const Paper = db.model("Paper");

  return new Promise((resolve, reject) => {
    Paper.find({
      "authors.name": authorName
    }, (err, result) => {
      resolve(result);
    });
  });
}

async function findAuthorsFromPaper(paper, authorName, authorId, currLevel, maxLevel, nodeLinks) {
  if (currLevel <= maxLevel && paper !== undefined && !(paper.id in nodeLinks.papers)) {
    const {
      authors
    } = paper;
    nodeLinks.papers[paper.id] = paper.id;

    if (!(authorId in nodeLinks.authors)) {
      nodeLinks.authors[authorId] = authorId;
      nodeLinks.nodes.push(minimizeAuthor(authorId, authorName, paper, currLevel));
    }
    await Promise.all(authors.map(async author => {
      const coAuthorId = author.ids[0] || author.name;
      if (!(coAuthorId in nodeLinks.authors)) {
        nodeLinks.nodes.push(minimizeAuthor(coAuthorId, author.name, paper, currLevel + 1));
        nodeLinks.authors[coAuthorId] = coAuthorId;
      }

      if (coAuthorId !== authorId) {
        nodeLinks.links.push({
          source: coAuthorId,
          target: authorId
        });

        if ((currLevel + 1) < maxLevel) {
          const papers = await getPapersFromAuthorName(author.name);

          if (!papers[0]) {
            logger.info({
              handler: handlerName,
              message: `unable to find paper with author name ${author.name}`
            });
          } else {
            await Promise.all(papers.map(async paper => {
              await findAuthorsFromPaper(paper, author.name, coAuthorId, currLevel + 1, maxLevel, nodeLinks);
            }));
          }
        }
      }
    }));
  }
}

/**
 * Returns a array of nodes and links to build co-author graph.
 *
 * @param {string} authorName Author's name.
 * @param {int} level Depth of the graph.
 */
async function getCoAuthorsGraph(authorName, level) {
  const nodeLinks = {
    nodes: [],
    links: [],
    papers: {},
    authors: {}
  };

  const papers = await getPapersFromAuthorName(authorName);

  if (!papers[0]) {
    logger.info({
      handler: handlerName,
      message: `unable to find paper with author name ${authorName}`
    });
  } else {
    await Promise.all(papers.map(async paper => {
      const authorId = findAuthorId(paper, authorName);
      await findAuthorsFromPaper(paper, authorName, authorId, 0, level, nodeLinks);
    }));
  }

  delete nodeLinks.authors;
  delete nodeLinks.papers;

  return nodeLinks;
}

function handler(options) {
  ({
    logger,
    db
  } = options);

  return (req, res) => {
    const params = req.query;

    if (!("author" in params)) {
      res.status(400).send(JSON.stringify(commonErrorResponse.invalidField));
    }

    const authorName = params.author.trim();
    const level = parseInt(params.levels, 10) || 2;

    logger.info({
      handler: handlerName,
      authorName,
      maxLevel: level
    });

    getCoAuthorsGraph(authorName, level).then(result => {
      res.send(JSON.stringify(result));
    });
  };
}

module.exports = handler;
