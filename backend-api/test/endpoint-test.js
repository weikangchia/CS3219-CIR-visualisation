process.env.NODE_ENV = "test";
process.env.PORT = 3001;

const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const Mockgoose = require("mockgoose").Mockgoose; // eslint-disable-line
const mockgoose = new Mockgoose(mongoose);

const server = require("../app");

const should = chai.should();

chai.use(chaiHttp);

const options = {
  should,
  mockgoose,
  mongoose,
  chaiHttp,
  chai,
  sinon,
  server
};

before(done => {
  mockgoose.prepareStorage().then(() => {
    mongoose.connect(
      "mongodb://example.com/cs3219", {
        useMongoClient: true
      },
      err => {
        done(err);
      }
    );
  });
});

describe("/GET index", () => {
  require("./endpoints/index-test")(options);
});

describe("/GET trends/keyphrase", () => {
  require("./endpoints/trendsKeyPhrase-test")(options);
});

describe("/GET trends/conference", () => {
  require("./endpoints/trendsConference-test")(options);
});

describe("/GET graphs/incitation", () => {
  require("./endpoints/graphsIncitation-test")(options);
});

describe("/GET top-X-of-Y", () => {
  require("./endpoints/topxofy-test")(options);
});

after(done => {
  mongoose.connection.close();
  done();
});
