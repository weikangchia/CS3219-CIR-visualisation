/**
 * Keeps all papers and provides some generic functions to access them
 */
class PapersController {
  constructor() {
    this.papers = [];
    this.papersObject = null;
    this.authorsObject = null;
  }

  /**
   * Returns the authors object.
   */
  getAuthorsObject() {
    if (this.authorsObject == null) {
      const obj = {};

      this.papers.forEach(paper =>
        // eslint-disable-next-line no-return-assign
        paper.getAuthors().forEach(author => (obj[author.getId()] = obj[author.getId()] || author)));
      this.authorsObject = obj;
    }

    return this.authorsObject;
  }

  /**
   * Returns the papers object.
   */
  getPapersObject() {
    if (this.papersObject == null) {
      const obj = {};
      // eslint-disable-next-line no-return-assign
      this.papers.forEach(paper => (obj[paper.getId()] = obj[paper.getId()] || paper));
      this.papersObject = obj;
    }

    return this.papersObject;
  }

  /**
   * Set the papers.
   *
   * @param {*} papers
   */
  setPapers(papers) {
    this.papersObject = null;
    this.authorsObject = null;
    this.papers = papers;
  }

  /**
   * Returns all the papers.
   */
  getPapers() {
    return this.papers;
  }

  /**
   * Group paper based on the options.
   *
   * @typedef {Object.<string, Paper[]>} PaperGroups
   *
   * @callback paperFilter
   * @param {Paper} paper
   * @param {PaperGroups} groups already grouped papers
   * @returns {boolean} true if paper is to be processed
   *
   * @callback groupsFromPaper
   * @param {Paper} paper
   * @returns {string[]} groups that paper belongs in

  * @typedef {Object} GroupingOptions
  * @property {groupsFromPaper} groupsFromPaper default a function that returns JSON.stringify(paper)
  * @property {paperFilter} paperFilter if not specified all papers will be included
  *
  * @param {GroupingOptions} options
  */
  group(options) {
    options = options || {};

    options.groupsFromPaper =
      options.groupsFromPaper ||
      (paper => {
        [JSON.stringify(paper)];
      });

    const groups = {};
    this.papers.forEach(paper => {
      if (options.paperFilter && !options.paperFilter(paper, groups)) {
        return;
      }
      options.groupsFromPaper(paper).forEach(key => {
        groups[key] = groups[key] || [];
        groups[key].push(paper);
      });
    });

    return groups;
  }
}

module.exports = PapersController;
