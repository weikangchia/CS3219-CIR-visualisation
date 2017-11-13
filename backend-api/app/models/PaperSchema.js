const mongoose = require("mongoose");

/**
 * A schema for Paper.
 */

/* eslint prefer-destructuring: 0 */
const Schema = mongoose.Schema;

const PaperSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  id: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    trim: true
  },
  venue: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  inCitations: {
    type: Array
  },
  outCitations: {
    type: Array
  },
  authors: {
    type: Array
  },
  keyPhrases: {
    type: Array
  },
  paperAbstract: {
    type: String
  },
  pdfUrls: {
    type: Array
  },
  s2Url: {
    type: String
  }
});

module.exports = PaperSchema;
