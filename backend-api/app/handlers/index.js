/**
 * Collections of handlers.
 */

/* eslint-disable global-require */
module.exports = function (option) {
  return {
    topNXofYHandler: require("./topXofYHandler")(option),
    trendPublicationHandler: require("./trendPublicationHandler")(option),
    trendKeyPhraseHandler: require("./trendKeyPhraseHandler")(option),
    coAuthorsHandler: require("./graphCoAuthorsHandler")(option),
    graphIncitationHandler: require("./graphIncitationHandler")(option)
  };
};
