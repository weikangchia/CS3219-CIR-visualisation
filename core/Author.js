var Author = (function() {
  function Constructor() {
    this.id = ''
    this.name = ''
  }
  Constructor.prototype = {
    getName() {
      return this.name;
    },
    setName(name) {
      this.name = name;
    },
    getId() {
      return this.id;
    },
    setId(id) {
      this.id = id;
    }
  };
  return Constructor;
})();
module.exports = Author;
