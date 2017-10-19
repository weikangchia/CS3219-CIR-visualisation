class PapersController {
  constructor() {
    this.papers = [];
    this.papersObject = null;
  }

  getPapersObject() {
    if (this.papersObject == null) {
      var obj = {};
      this.papers.forEach(
        paper => (obj[paper.getId()] = obj[paper.getId()] || paper)
      );
    }
    return obj;
  }

  setPapers(papers) {
    this.papersObject = null;
    this.papers = papers;
  }

  getPapers() {
    return this.papers;
  }

  /**
   * Group paper based on the options.
   *
   * 
   * @callback paperFilter
   * @param {Paper} paper
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
      if (options.paperFilter && !options.paperFilter(paper)) {
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
