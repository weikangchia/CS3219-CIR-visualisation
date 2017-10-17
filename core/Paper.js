var Paper = (function() {
  var Constructor = function() {
    this.title = ''
    this.authors = []
  };
  Constructor.prototype = {
    getTitle() {
      return this.title;
    },
    setTitle(title) {
      this.title = title;
    },
    getAuthors() {
      return this.authors;
    },
    setAuthors(authors) {
      this.authors = authors;
    },
    addAuthor(author) {
      this.authors.push(author);
    }
  };
  return Constructor;
})();

module.exports = Paper;
