class Paper {
  constructor() {
    this.title = "";
    this.authors = [];
    this.venue = "";
    this.inCitations = []
    this.outCitations = []
    this.year = null
    this.abstract = ''
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

  getInCitations() {
    return this.inCitations;
  }

  setInCitations(inCitations) {
    this.inCitations = inCitations;
  }

  getOutCitations() {
    return this.outCitations;
  }

  setOutCitations(outCitations) {
    this.outCitations = outCitations;
  }

  getYear() {
    return this.year;
  }

  setYear(year) {
    this.year = year;
  }

  getAbstract() {
    return this.abstract;
  }

  setAbstract(abstract) {
    this.abstract = abstract;
  }
}

module.exports = Paper;
