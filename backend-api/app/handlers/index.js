/**
 * Collections of handlers.
 */

/* eslint-disable global-require */
module.exports = function (option) {
  return {
    topNXofYHandler: require("./topXofYHandler")(option),
    trendPublicationHandler: require("./trendPublicationHandler")(option),
    trendKeyPhraseHandler: require("./trendKeyPhraseHandler")(option),
    autocompleteHandler: require("./autocompleteHandler")(option),
    graphIncitationHandler: require("./graphIncitationHandler")(option)
  };
};
/* eslint-enable global-require */
