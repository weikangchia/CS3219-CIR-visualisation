var Paper = (function() {
  var Constructor = function() {
    this.title = ''
    this.authors = []
    this.venue = ''
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
    },
    getVenue(venue){
      return this.venue
    },
    setVenue(venue){
      this.venue = venue
    }
  };
  return Constructor;
})();

module.exports = Paper;
