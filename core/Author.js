class Author {
  constructor() {
    this.id = "";
    this.name = "";
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }
}

module.exports = Author;
