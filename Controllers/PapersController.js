var Controller = (function() {
  function Constructor() {
    this.papers = [];
  }
  Constructor.prototype = {
    setPapers: function(papers) {
      this.papers = papers;
    },
    getPapers: function() {
      return this.papers;
    },
    addPaper: function(paper) {
      this.papers.push(paper);
    },
    /**
     * @callback paperFilter
     * @param {Paper} paper
     * @returns true if paper is to be included
     */
    /**
     * @callback groupsFromPaper
     * @param {Paper} paper
     * @returns groups that paper belongs in
     */
    /**
     * @typedef {Object} GroupingOptions
     * @property {groupsFromPaper} groupsFromPaper default a function that returns JSON.stringify(paper)
     * @property {paperFilter} paperFilter if not specified all papers will be included
     */
    /**
     * @param {GroupingOptions} options
     */
    group: function(options) {
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
  };
  return Constructor;
})();
module.exports = Controller;
