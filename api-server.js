const commander = require('commander');
const express = require('express');

const Parser = require('./Parser.js');

const PapersController = require('./controllers/PapersController.js');

const app = express();
const papersController = new PapersController();

commander
  .version('0.1.0')
  .option(
    '-d, --directory <directory>',
    'Directory where json file(s) are located'
  )
  .option('-p, --port <port>', 'Port served on')
  .parse(process.argv);

// eslint-disable-next-line
let port = commander.port;
if (!port) {
  port = 3000;

  // eslint-disable-next-line no-console
  console.log(`Using default port: ${port}`);
} else {
  // eslint-disable-next-line no-console
  console.log(`Using port: ${port}`);
}

if (!commander.directory) {
  commander.directory = './data';

  // eslint-disable-next-line no-console
  console.log(`Using default data directory: ${commander.directory}`);
} else {
  // eslint-disable-next-line no-console
  console.log(`Using data directory: ${commander.directory}`);
}

/**
 * Business Logic
 */

/**
 * @param {integer} topN number of authors (default is 10)
 */
function getTopAuthors(topN) {
  topN = topN || 10;
  let topAuthors = papersController.group({
    groupsFromPaper: (paper) => {
      return paper.getAuthors().map((author) => {
        return author.name;
      });
    },
    filterPaper: (paper) => {
      return true;
    }
  });

  topAuthors = Object.keys(topAuthors)
    .sort((author1, author2) =>
      topAuthors[author2].length - topAuthors[author1].length)
    .slice(0, topN)
    .map((author) => {
      return {
        author,
        count: topAuthors[author].length
      };
    });

  return topAuthors;
}

/**
 * Define app
 */
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.setHeader('Content-Type', 'application/json');

  next();
});

app.get('/', (req, res) => {
  res.send(JSON.stringify({
    mode: 'test'
  }));
});

app.get('/top-authors', (req, res) => {
  // if (req) {}

  res.send(JSON.stringify(getTopAuthors()));
});

function startServer() {
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${server.address().port}`);
  });
}

/**
 * Parse the data files and start the server.
 */
const parser = new Parser();
parser.parseDirectory(commander.directory).then(
  (parsedPapers) => {
    papersController.setPapers(parsedPapers);
    startServer();
  },
  (err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  }
);
