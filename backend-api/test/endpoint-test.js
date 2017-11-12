process.env.NODE_ENV = "test";
process.env.PORT = 3001;

const commonErrorResponse = require("../app/common").errorResponse;

const {
  invalidField,
  invalidDomain
} = commonErrorResponse;

const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const Mockgoose = require("mockgoose").Mockgoose; // eslint-disable-line
const mockgoose = new Mockgoose(mongoose);

const server = require("../app");

chai.should();
chai.use(chaiHttp);

let Paper;
before(done => {
  mockgoose.prepareStorage().then(() => {
    mongoose.connect(
      "mongodb://example.com/cs3219", {
        useMongoClient: true
      },
      err => {
        const db = mongoose.connection;
        Paper = db.model("Paper");
        done(err);
      }
    );
  });
});

describe("/GET index", () => {
  it("it should GET a JSON object containing hello world message", done => {
    chai
      .request(server)
      .get("/")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("message");
        res.body.message.should.equal("hello world");
        done();
      });
  });
});

describe("/GET trends/keyphrase", () => {
  beforeEach(() => {
    sinon.stub(Paper, "find");
  });

  afterEach(() => {
    Paper.find.restore();
  });

  it("it should GET an array of keyphrase trends", done => {
    const expectedResult = [{
        _id: "59f32bd4cd71fe9b08c653e9",
        year: 2015
      },
      {
        _id: "59f32bd5cd71fe9b08c6691a",
        year: 2015
      },
      {
        _id: "59f32bd5cd71fe9b08c6837c",
        year: 2016
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/trends/keyphrase?phrase=abc&minYear=2015&maxYear=2017")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(3);

        res.body[0].year.should.equal("2015");
        res.body[0].count.should.equal(2);

        res.body[1].year.should.equal("2016");
        res.body[1].count.should.equal(1);

        res.body[2].year.should.equal("2017");
        res.body[2].count.should.equal(0);
        done();
      });
  });

  it("it should return 400 for empty phrase", done => {
    chai
      .request(server)
      .get("/trends/keyphrase")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.error.code.should.equal(invalidField.error.code);
        res.body.error.message.should.equal(invalidField.error.message);
        done();
      });
  });

  it("it should return 200 for empty year", done => {
    Paper.find.yields(null, []);
    chai
      .request(server)
      .get("/trends/keyphrase?phrase=abc")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.equal(1);

        res.body[0].year.should.equal("1800");
        res.body[0].count.should.equal(0);
        done();
      });
  });

  it("it should return 200 for empty minYear", done => {
    Paper.find.yields(null, []);
    chai
      .request(server)
      .get("/trends/keyphrase?phrase=abc&maxYear=1803")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.equal(4);

        res.body[0].year.should.equal("1800");
        res.body[0].count.should.equal(0);

        res.body[1].year.should.equal("1801");
        res.body[1].count.should.equal(0);

        res.body[2].year.should.equal("1802");
        res.body[2].count.should.equal(0);

        res.body[3].year.should.equal("1803");
        res.body[3].count.should.equal(0);
        done();
      });
  });
});

describe("/GET trends/conference", () => {
  beforeEach(() => {
    sinon.stub(Paper, "aggregate");
  });

  afterEach(() => {
    Paper.aggregate.restore();
  });

  it("it should return 400 for empty name", done => {
    chai
      .request(server)
      .get("/trends/conference")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.error.code.should.equal(invalidField.error.code);
        res.body.error.message.should.equal(invalidField.error.message);
        done();
      });
  });

  it("it should use default minYear and maxYear", done => {
    const expectedResult = [];

    Paper.aggregate.yields(null, expectedResult);

    chai
      .request(server)
      .get("/trends/conference?name=icse")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(1);
        res.body[0].year.should.equal(1800);
        res.body[0].count.should.equal(0);
        done();
      });
  });

  it("it should GET an array of conference trends", done => {
    const expectedResult = [{
        count: 1,
        year: 2015
      },
      {
        count: 1,
        year: 2016
      }
    ];

    Paper.aggregate.yields(null, expectedResult);

    chai
      .request(server)
      .get("/trends/conference?name=icse&minYear=2015&maxYear=2017")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(3);
        done();
      });
  });
});

describe("/GET graphs/incitation", () => {
  beforeEach(() => {
    sinon.stub(Paper, "findOne");
  });

  afterEach(() => {
    Paper.findOne.restore();
  });

  it("it should return 400 for empty title", done => {
    chai
      .request(server)
      .get("/graphs/incitation")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.error.code.should.equal(invalidField.error.code);
        res.body.error.message.should.equal(invalidField.error.message);
        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = {
      id: 123,
      authors: [],
      title: "abc",
      year: 2017,
      abstract: "abstract test",
      pdfUrls: [],
      inCitations: ["246"]
    };

    Paper.findOne.yields(null, expectedResult);

    chai
      .request(server)
      .get("/graphs/incitation?title=abc")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        res.body.should.have.property("nodes");
        res.body.should.have.property("links");

        res.body.nodes.length.should.equal(1);
        done();
      });
  });
});

describe("/GET graphs/coauthors", () => {
  beforeEach(() => {
    sinon.stub(Paper, "find");
  });

  afterEach(() => {
    Paper.find.restore();
  });

  it("it should return 400 for empty author", done => {
    chai
      .request(server)
      .get("/graphs/coauthors")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.error.code.should.equal(invalidField.error.code);
        res.body.error.message.should.equal(invalidField.error.message);
        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [{
        id: 123,
        authors: [{
          ids: 456,
          name: "jack"
        }]
      },
      {
        id: 234,
        authors: [{
          ids: 456,
          name: "jack"
        }, {
          ids: 789,
          name: "mary"
        }]
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/graphs/coauthors?author=abc")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      });
  });
});

describe("/GET autocomplete", () => {
  beforeEach(() => {
    sinon.stub(Paper, "aggregate");
  });

  afterEach(() => {
    Paper.aggregate.restore();
  });

  it("it should return 400 for empty search value", done => {
    chai
      .request(server)
      .get("/autocomplete")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.error.code.should.equal(invalidField.error.code);
        res.body.error.message.should.equal(invalidField.error.message);
        done();
      });
  });

  it("it should return 400 for invalid domain", done => {
    chai
      .request(server)
      .get("/autocomplete?search=abc&domain=random")
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.a("object");
        res.body.error.code.should.equal(invalidDomain.error.code);
        res.body.error.message.should.equal(invalidDomain.error.message);
        done();
      });
  });

  it("it should return 200 for valid search and in venue domain", done => {
    const expectedResult = ["Arab journal of urology", "ARC", "Arch. Math. Log."];

    Paper.aggregate.yields(null, expectedResult);

    chai
      .request(server)
      .get("/autocomplete?search=ar&domain=venue")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(3);
        done();
      });
  });

  it("it should return 200 for exact search match and in venue domain", done => {
    const expectedResult = ["ArXiv"];

    Paper.aggregate.yields(null, expectedResult);

    chai
      .request(server)
      .get("/autocomplete?search=ArXiv&domain=venue")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(1);
        done();
      });
  });

  it("it should return 200 for valid search and in author domain", done => {
    const expectedResult = ["Ar", "Ar Argentina", "Ar Belkov", "AR Chopade", "AR Dorosty"];

    Paper.aggregate.yields(null, expectedResult);

    chai
      .request(server)
      .get("/autocomplete?search=ar&domain=author")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(5);
        done();
      });
  });

  it("it should return 200 for valid search and in year domain", done => {
    const expectedResult = ["2010", "2011", "2012"];

    Paper.aggregate.yields(null, expectedResult);

    chai
      .request(server)
      .get("/autocomplete?search=201&domain=year")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        res.body.length.should.equal(3);
        done();
      });
  });
});

after(done => {
  mongoose.connection.close();
  done();
});
