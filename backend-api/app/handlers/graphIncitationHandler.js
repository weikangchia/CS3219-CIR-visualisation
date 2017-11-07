let logger;
let db;

async function getPaperByTitle(title) {
  return new Promise((resolve, reject) => {
    const Paper = db.model("Paper");

    Paper.findOne({
      title
    }, (err, result) => {
      resolve(result);
    });
  });
}

async function getPaperById(id) {
  return new Promise((resolve, reject) => {
    const Paper = db.model("Paper");

    Paper.findOne({
      id
    }, (err, result) => {
      resolve(result);
    });
  });
}

async function dig(paper, currentLevel, maxLevel, parentPaperId) {
  if (currentLevel > maxLevel) {
    logger.info(`Level ${currentLevel}: Level reach`);
  } else if (paper === null) {
    logger.info(`Level ${currentLevel}: Paper is null`);
  } else {
    const {
      inCitations
    } = paper;

    await Promise.all(inCitations.map(async citationId => {
      const citedPaper = await getPaperById(citationId);
      if (citedPaper === null) {
        logger.info(`Level ${currentLevel}: Citation Id: ${citationId}: null (skip): Parent Id: ${parentPaperId}`);
      } else {
        logger.info(`Level ${currentLevel}: Citation Id: ${citationId}: ${citedPaper.inCitations.length} (digging): Parent Id: ${parentPaperId}`);
        await dig(citedPaper, currentLevel + 1, maxLevel, citationId);
      }
    }));
  }
}

function handler(options) {
  return (req, res) => {
    ({
      logger,
      db
    } = options);

    const params = req.query;

    logger.info(`Graph max level: ${params.level}`);
    logger.info(`Graph title: ${params.title}`);

    getPaperByTitle(params.title).then(paper => {
      dig(paper, 0, parseInt(params.level, 10)).then(() => {
        logger.info("done");
        res.send("done");
      });
    });
  };
}

module.exports = handler;
