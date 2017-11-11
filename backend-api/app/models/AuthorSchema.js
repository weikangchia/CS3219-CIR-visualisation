const mongoose = require("mongoose");

/* eslint prefer-destructuring: 0 */
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  id: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    unique: true
  }
});

module.exports = AuthorSchema;
