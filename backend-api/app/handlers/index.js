module.exports = function(option) {
  return { 
    topAuthorHandler: require("./topAuthorHandler.js")(option),
    topNXofYHandler: require("./topXofYHandler.js")(option)
  };
};
