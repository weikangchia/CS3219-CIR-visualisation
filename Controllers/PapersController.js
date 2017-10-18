class PapersController {
  constructor() {
    this.papers = [];
  }

  setPapers(papers) {
    this.papers = papers;
  }

  getPapers() {
    return this.papers;
  }

  addPaper(paper) {
    this.papers.push(paper);
  }

  /**
   * Group paper based on the options.
   *
   * @callback paperFilter
   * @param {Paper} paper
   * @returns true if the paper is to be included
   *
   * @callback groupsFromPaper
   * @param {Paper} paper
   * @returns groups that paper belongs in
   *
   * @typedef {Object} GroupingOptions
   * @property {function} filter
   *
   * @param {GroupingOptions} options
   */
  group(options) {
    const groups = {};
    this.papers.forEach((paper) => {
      if (options.paperFilter && !options.paperFilter(paper)) {
        return;
      }
      options.groupsFromPaper(paper).forEach((key) => {
        groups[key] = groups[key] || [];
        groups[key].push(paper);
      });
    });

    return groups;
  }
}

module.exports = PapersController;
