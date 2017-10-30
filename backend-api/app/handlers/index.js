module.exports = function(option) {
  return { 
    topAuthorHandler: require("./topAuthorHandler.js")(option)
  };
};
