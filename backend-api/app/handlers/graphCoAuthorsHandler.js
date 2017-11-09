let logger;
let db;

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
    logger.info(`No Papers found with author's Name: ${sourceAuthorName}`);
  } else {
    await Promise.all(papers.map(async paper => {
      // logger.info(paper.title);
      // logger.info(paper.authors);
      /* eslint-disable no-use-before-define */
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

    // logger.info("Authors: " + authors);
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
            // logger.info(paper.title);
            // logger.info("Source: " + author.ids[0] + " " + "Target: " + authorId);
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
    logger.info(`No Papers found with author's Name: ${authorName}`);
  } else {
    await Promise.all(papers.map(async paper => {
      // logger.info(paper.authors);
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
    const authorName = params.author.trim() || "";
    const level = parseInt(params.level, 10) || 2;

    getCoAuthorsGraph(authorName, level).then(result => {
      res.send(JSON.stringify(result));
    });
  };
}

module.exports = handler;