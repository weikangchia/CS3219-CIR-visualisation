class PapersController {
  constructor() {
    this.papers = [];
    this.papersObject = null;
    this.authorsObject = null;
  }

  getAuthorsObject() {
    if (this.authorsObject == null) {
      var obj = {};
      this.papers.forEach(paper =>
        paper
          .getAuthors()
          .forEach(
            author => (obj[author.getId()] = obj[author.getId()] || author)
          )
      );
      this.authorsObject = obj;
    }
    return this.authorsObject;
  }

  getPapersObject() {
    if (this.papersObject == null) {
      var obj = {};
      this.papers.forEach(
        paper => (obj[paper.getId()] = obj[paper.getId()] || paper)
      );
      this.papersObject = obj;
    }
    return this.papersObject;
  }

  setPapers(papers) {
    this.papersObject = null;
    this.authorsObject = null;
    this.papers = papers;
  }

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
   * @param {PaperGroups} already grouped papers
   * @returns true if paper is to be included
   *
   * @callback groupsFromPaper
   * @param {Paper} paper
   * @returns groups that paper belongs in

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

    var groups = {};
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
