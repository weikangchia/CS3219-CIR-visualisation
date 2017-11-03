/**
 * Collections of handlers.
 */

/* eslint-disable global-require */
module.exports = function (option) {
  return {
    topAuthorHandler: require("./topAuthorHandler")(option),
    topNXofYHandler: require("./topXofYHandler")(option),
    trendPublicationHandler: require("./trendPublicationHandler")(option),
    trendKeyPhraseHandler: require("./trendKeyPhraseHandler")(option)
  };
};
