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
     * @property {function} filter
     */
    /**
     * @param {GroupingOptions} options
     */
    group: function(options) {
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
      return groups
    }
  };
  return Constructor;
})();
module.exports = Controller;
