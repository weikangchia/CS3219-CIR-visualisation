const express = require('express');
const path = require('path');
const serveIndex = require('serve-index');

const app = express();

// Serve index at /
app.use('/', express.static('public/'), serveIndex('public', {
  icons: true
}));

app.use("/public", express.static(path.join(__dirname, "public")));

const server = app.listen(9000, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${server.address().port}`);
});
