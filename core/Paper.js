class Paper {
  constructor() {
    this.title = "";
    this.authors = [];
    this.venue = "";
  }

  setId(id) {
    this.id = id;
  }

  getId(){
    return this.id
  }

  getTitle() {
    return this.title;
  }

  setTitle(title) {
    this.title = title;
  }

  getAuthors() {
    return this.authors;
  }

  setAuthors(authors) {
    this.authors = authors;
  }

  addAuthor(author) {
    this.authors.push(author);
  }

  getVenue(venue) {
    return this.venue;
  }

  setVenue(venue) {
    this.venue = venue;
  }
}

module.exports = Paper;
