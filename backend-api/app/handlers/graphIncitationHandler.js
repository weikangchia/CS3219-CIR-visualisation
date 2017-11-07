let logger;
let db;

const handlerName = "graphIncitationHandler";

const paperProjOptions = {
  inCitations: 1,
  authors: 1,
  paperAbstract: 1,
  title: 1,
  year: 1,
  pdfUrls: 1,
  id: 1
};

async function getPaperByTitle(title, projections) {
  return new Promise((resolve, reject) => {
    const Paper = db.model("Paper");

    Paper.findOne({
      title
    }, projections, (err, result) => {
      resolve(result);
    });
  });
}

async function getPaperById(id, projections) {
  return new Promise((resolve, reject) => {
    const Paper = db.model("Paper");

    Paper.findOne({
      id
    }, projections, (err, result) => {
      resolve(result);
    });
  });
}

function parsePaper(paper) {
  return {
    id: paper.id,
    authors: paper.authors,
    title: paper.title,
    year: paper.year,
    abstract: paper.paperAbstract,
    pdfUrl: paper.pdfUrls.length > 0 ? paper.pdfUrls[0] : ""
  };
}

async function dig(paper, currentLevel, maxLevel, basePaperId, nodeLinks) {
  if (currentLevel === 0) {
    nodeLinks.rawNodes[paper.id] = parsePaper(paper);
  }

  if (currentLevel >= maxLevel) {
    logger.info(`handler="${handlerName}" currentLevel=${currentLevel} message="level reached"`);
  } else {
    const {
      inCitations
    } = paper;

    await Promise.all(inCitations.map(async inCitationId => {
      const inCitedPaper = await getPaperById(inCitationId, paperProjOptions);

      if (inCitedPaper === null) {
        /* logger.info(`handler="${handlerName}" currentLevel=${currentLevel} citationId="${inCitationId}" ` +
          `message="null (skipping)" parentId="${basePaperId}"`); */
      } else {
        nodeLinks.rawNodes[inCitedPaper.id] = parsePaper(inCitedPaper);

        nodeLinks
          .links
          .push({
            source: inCitationId,
            target: paper.id
          });

        /* logger.info(`handler="${handlerName}" currentLevel=${currentLevel} citationId="${inCitationId}" ` +
          `incitationLength=${inCitedPaper.inCitations.length} message="continue to dig" parentId="${basePaperId}"`); */

        await dig(inCitedPaper, currentLevel + 1, maxLevel, inCitationId, nodeLinks);
      }
    }));
  }

  return nodeLinks;
}

function handler(options) {
  return (req, res) => {
    ({
      logger,
      db
    } = options);

    const params = req.query;

    const {
      title,
      level
    } = params;

    logger.info(`handler="${handlerName}" title="${title}" maxLevel=${level}`);

    getPaperByTitle(params.title, paperProjOptions).then(paper => {
      const nodeLinks = {
        rawNodes: {},
        nodes: [],
        links: []
      };

      if (paper === null) {
        logger.info(`handler="${handlerName}" message="unable to find paper ${title}"`);
        res.send(nodeLinks);
      } else {
        dig(paper, 0, parseInt(level, 10), null, nodeLinks).then(result => {
          Object.keys(nodeLinks.rawNodes).forEach(key => {
            nodeLinks.nodes.push(nodeLinks.rawNodes[key]);
          });

          delete nodeLinks.rawNodes;

          res.send(JSON.stringify(result));
        });
      }
    });
  };
}

module.exports = handler;
