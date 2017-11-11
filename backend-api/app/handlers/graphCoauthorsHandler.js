const commonErrorResponse = require("../common").errorResponse;

let logger;
let db;

const handlerName = "graphCoauthorsHandler";

function minimizeAuthor(authorId, paper, level) {
  const selectedAuthor = paper.authors.find(author => author.ids[0] === authorId);

  return {
    id: authorId,
    level,
    author: selectedAuthor ? selectedAuthor.name : "undefined",
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
      authorId = author.ids[0] ? author.ids[0] : undefined;
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

async function dig(currLevel, maxLevel, sourceAuthorName, nodeLinks) {
  const papers = await getPapersFromAuthorName(sourceAuthorName);

  if (papers === null) {
    logger.info({
      handler: handlerName,
      message: `unable to find paper with author name ${sourceAuthorName}`
    });
  } else {
    await Promise.all(papers.map(async paper => {
      await findAuthorsFromPaper(paper, sourceAuthorName, currLevel, maxLevel, nodeLinks);
    }));
  }
}

async function findAuthorsFromPaper(paper, authorName, currLevel, maxLevel, nodeLinks) {
  if (currLevel <= maxLevel && paper !== undefined && !(paper.id in nodeLinks.papers)) {
    const {
      authors
    } = paper;
    nodeLinks.papers[paper.id] = paper.id;

    const authorId = findAuthorId(paper, authorName);
    if (!(authorId in nodeLinks.authors) && authorId !== undefined) {
      nodeLinks.authors[authorId] = authorId;
      nodeLinks.nodes.push(minimizeAuthor(authorId, paper, currLevel));
    }

    if (authorId !== undefined) {
      await Promise.all(authors.map(async author => {
        const coAuthorId = author.ids[0] ? author.ids[0] : undefined;
        if (coAuthorId !== undefined) {
          if (!(coAuthorId in nodeLinks.authors)) {
            nodeLinks.nodes.push(minimizeAuthor(coAuthorId, paper, currLevel + 1));
            nodeLinks.authors[coAuthorId] = coAuthorId;
          }

          if (coAuthorId !== authorId) {
            nodeLinks.links.push({
              source: author.ids[0],
              target: authorId
            });

            if ((currLevel + 1) < maxLevel) {
              await dig(currLevel + 1, maxLevel, author.name, nodeLinks);
            }
          }
        }
      }));
    }
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

  if (papers === null) {
    logger.info({
      handler: handlerName,
      message: `unable to find paper with author name ${authorName}`
    });
  } else {
    await Promise.all(papers.map(async paper => {
      await findAuthorsFromPaper(paper, authorName, 0, level, nodeLinks);
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
