const topAuthorHandler = require("./topAuthorHandler.js");

module.exports = function (option) {
  return {
    topAuthorHandler: topAuthorHandler(option)
  };
};
