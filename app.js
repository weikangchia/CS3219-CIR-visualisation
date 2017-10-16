const express = require('express');
const path = require('path');

const port = 3000;

const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('hello world');
});

app.listen(port, () => {
  console.log('Example app listening on port 3000!');
});
