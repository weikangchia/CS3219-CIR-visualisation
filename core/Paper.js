class Paper {
  constructor() {
    this.title = '';
    this.authors = [];
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
}

module.exports = Paper;
