process.env.NODE_ENV = "test";
process.env.PORT = 3001;

const sinon = require("sinon");
const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const Mockgoose = require("mockgoose").Mockgoose; // eslint-disable-line
const mockgoose = new Mockgoose(mongoose);

const server = require("../app");

chai.should();
chai.use(chaiHttp);

const invalidFieldCode = 400;
const invalidFieldMessage = "Missing field/invalid field.";

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
    const expectedResult = [
      {
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
        res.body.error.code.should.equal(invalidFieldCode);
        res.body.error.message.should.equal(invalidFieldMessage);
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
        res.body.error.code.should.equal(invalidFieldCode);
        res.body.error.message.should.equal(invalidFieldMessage);
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
    const expectedResult = [
      {
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
        res.body.error.code.should.equal(invalidFieldCode);
        res.body.error.message.should.equal(invalidFieldMessage);
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

describe("/GET top-X-of-Y", () => {
  beforeEach(() => {
    sinon.stub(Paper, "find");
  });

  afterEach(() => {
    Paper.find.restore();
  });

  it("it should return 200", done => {
    const expectedResult = [
      {
        _id: "59f5d5a5dfa15819497c7bc0",
        authors: [{ ids: ["1747337"], name: "Damien Chablat" },
          { ids: ["1750119"], name: "Jorge Angeles" }]
      },
      {
        _id: "59f5d5acdfa15819497d4668",
        authors: [{ ids: ["1776683"], name: "Liang Ma" },
          { ids: ["1747337"], name: "Damien Chablat" }]
      },
      {
        _id: "59f5d5afdfa15819497db2d6",
        authors: [{ ids: ["1749917"], name: "Daniel Kanaan" },
          { ids: ["1732597"], name: "Philippe Wenger" }, { ids: ["1747337"], name: "Damien Chablat" }]
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/top-X-of-Y?topN=3&y=venue&value=arxiv&x=author")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("topN");
        res.body.topN.should.equal("3");
        res.body.should.have.property("x");
        res.body.x.should.equal("author");
        res.body.should.have.property("y");
        res.body.y.should.equal("venue");
        res.body.should.have.property("value");
        res.body.value.should.equal("arxiv");

        res.body.should.have.property("results");
        res.body.results.length.should.equal(3);

        res.body.results[0].should.have.property("x");
        res.body.results[0].x.should.have.property("ids");
        res.body.results[0].x.ids[0].should.equal("1747337");
        res.body.results[0].x.should.have.property("name");
        res.body.results[0].x.name.should.equal("Damien Chablat");
        res.body.results[0].should.have.property("count");
        res.body.results[0].count.should.equal(3);

        res.body.results[1].should.have.property("x");
        res.body.results[1].x.should.have.property("ids");
        res.body.results[1].x.ids[0].should.equal("1732597");
        res.body.results[1].x.should.have.property("name");
        res.body.results[1].x.name.should.equal("Philippe Wenger");
        res.body.results[1].should.have.property("count");
        res.body.results[1].count.should.equal(1);

        res.body.results[2].should.have.property("x");
        res.body.results[2].x.should.have.property("ids");
        res.body.results[2].x.ids[0].should.equal("1749917");
        res.body.results[2].x.should.have.property("name");
        res.body.results[2].x.name.should.equal("Daniel Kanaan");
        res.body.results[2].should.have.property("count");
        res.body.results[2].count.should.equal(1);

        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [
      { _id: "59f5d5b6dfa15819497e8749", year: 2007 },
      { _id: "59f5d5b6dfa15819497e87d6", year: 2013 },
      { _id: "59f5d5b6dfa15819497e883a", year: 2012 },
      { _id: "59f5d5b6dfa15819497e886f", year: 2016 },
      { _id: "59f5d5b6dfa15819497e88b9", year: 2007 },
      { _id: "59f5d5b6dfa15819497e892e", year: 2015 },
      { _id: "59f5d5b6dfa15819497e8936", year: 2013 },
      { _id: "59f5d5b6dfa15819497e89f4", year: 2007 },
      { _id: "59f5d5b6dfa15819497e9024" }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/top-X-of-Y?topN=3&x=year")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("topN");
        res.body.topN.should.equal("3");
        res.body.should.have.property("x");
        res.body.x.should.equal("year");

        res.body.should.have.property("results");
        res.body.results.length.should.equal(3);

        res.body.results[0].should.have.property("x");
        res.body.results[0].x.should.have.property("year");
        res.body.results[0].x.year.should.equal(2007);
        res.body.results[0].should.have.property("count");
        res.body.results[0].count.should.equal(3);

        res.body.results[1].should.have.property("x");
        res.body.results[1].x.should.have.property("year");
        res.body.results[1].x.year.should.equal(2013);
        res.body.results[1].should.have.property("count");
        res.body.results[1].count.should.equal(2);

        res.body.results[2].should.have.property("x");
        res.body.results[2].x.should.have.property("year");
        res.body.results[2].x.year.should.equal(2012);
        res.body.results[2].should.have.property("count");
        res.body.results[2].count.should.equal(1);

        done();
      });
  });
  it("it should return 200", done => {
    const expectedResult = [
      {
        _id: "59f5d5b6dfa15819497e88b9",
        keyPhrases: ["Grammar", "CNN", "Chunking", "Convex", "NOUN"]
      },
      {
        _id: "59f5d5b6dfa15819497e892e",
        keyPhrases: ["XOR", "Binary", "CNN", "Circuit Design", "Adder Circuit"]
      },
      {
        _id: "59f5d5b6dfa15819497e8936",
        keyPhrases: ["CNN", "Termination", "Recursion", "Convex", "Terminating Function"]
      },
      {
        _id: "59f5d5b6dfa15819497e89f4",
        keyPhrases: ["Witness", "Worst-case", "Number Of Edge", "Vertices U", "K Edges"]
      },
      {
        _id: "59f5d5b6dfa15819497e9024",
        keyPhrases: []
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/top-X-of-Y?topN=3&y=venues&value=arxiv&x=keyphrase")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("topN");
        res.body.topN.should.equal("3");
        res.body.should.have.property("x");
        res.body.x.should.equal("keyphrase");
        res.body.should.have.property("y");
        res.body.y.should.equal("venues");
        res.body.should.have.property("value");
        res.body.value.should.equal("arxiv");

        res.body.should.have.property("results");
        res.body.results.length.should.equal(3);

        res.body.results[0].should.have.property("x");
        res.body.results[0].x.should.have.property("keyPhrase");
        res.body.results[0].x.keyPhrase.should.equal("CNN");
        res.body.results[0].should.have.property("count");
        res.body.results[0].count.should.equal(3);

        res.body.results[1].should.have.property("x");
        res.body.results[1].x.should.have.property("keyPhrase");
        res.body.results[1].x.keyPhrase.should.equal("Convex");
        res.body.results[1].should.have.property("count");
        res.body.results[1].count.should.equal(2);

        res.body.results[2].should.have.property("x");
        res.body.results[2].x.should.have.property("keyPhrase");
        res.body.results[2].x.keyPhrase.should.equal("Adder Circuit");
        res.body.results[2].should.have.property("count");
        res.body.results[2].count.should.equal(1);

        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [
      { _id: "59f5d5b4dfa15819497e357e", venue: "ArXiv" },
      { _id: "59f5d5b4dfa15819497e3d7d", venue: "ArXiv" },
      { _id: "59f5d5b5dfa15819497e4b35", venue: "CVPR" },
      { _id: "59f5d5b5dfa15819497e4dfd", venue: "Journal of Circuits, Systems, and Computers" },
      { _id: "59f5d5b5dfa15819497e5b9f", venue: "ACCV" },
      { _id: "59f5d5b5dfa15819497e6002", venue: "Mach. Vis. Appl." },
      { _id: "59f5d5b6dfa15819497e6a02", venue: "MICCAI" },
      { _id: "59f5d5b6dfa15819497e77e0", venue: "Comp. Int. and Neurosc." }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/top-X-of-Y?topN=3&y=keyphrase&value=CNN&x=venues")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("topN");
        res.body.topN.should.equal("3");
        res.body.should.have.property("x");
        res.body.x.should.equal("venues");
        res.body.should.have.property("y");
        res.body.y.should.equal("keyphrase");
        res.body.should.have.property("value");
        res.body.value.should.equal("CNN");

        res.body.should.have.property("results");
        res.body.results.length.should.equal(3);

        res.body.results[0].should.have.property("x");
        res.body.results[0].x.should.have.property("venue");
        res.body.results[0].x.venue.should.equal("ArXiv");
        res.body.results[0].should.have.property("count");
        res.body.results[0].count.should.equal(2);

        res.body.results[1].should.have.property("x");
        res.body.results[1].x.should.have.property("venue");
        res.body.results[1].x.venue.should.equal("CVPR");
        res.body.results[1].should.have.property("count");
        res.body.results[1].count.should.equal(1);

        res.body.results[2].should.have.property("x");
        res.body.results[2].x.should.have.property("venue");
        res.body.results[2].x.venue.should.equal("Journal of Circuits, Systems, and Computers");
        res.body.results[2].should.have.property("count");
        res.body.results[2].count.should.equal(1);

        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [
      {
        _id: "59f5d5b6dfa15819497e8b3d",
        authors: [{ ids: ["2378382"], name: "Andreas Darmann" }],
        id: "827b9d00200d2aedcf942230b1aad5f9b06e5776",
        inCitations: ["7d12e1978c504b00e23af34e5edeb498536b1c23",
          "2c3903c7a53e5aa21de91aac40882c7638635b61", "507e8c35890f2be08416df4538c379c1f1cc2f63",
          "9d86a7016b083838b518cb368c4631c20c817cb2"],
        keyPhrases: ["Balanced Allocation"],
        outCitations: [],
        title: "Proportional Borda allocations",
        venue: "Social Choice and Welfare",
        year: 2016
      },
      {
        _id: "59f5d5b6dfa15819497e8b41",
        authors: [{ ids: ["5302058"], name: "Hasan Göçer" }],
        id: "82828bced68f4d037f0cc4d68d33d9e1d5318c68",
        inCitations: [],
        keyPhrases: [],
        outCitations: [],
        title: "Comparison of treatment",
        venue: "Nigerian medical journal",
        year: 2016
      },
      {
        _id: "59f5d5b6dfa15819497e8b43",
        authors: [{ ids: ["5018653"], name: "Kara Hanson" }],
        id: "827d66ab33c470a205d6564740be249087b68c19",
        inCitations: [],
        keyPhrases: ["District"],
        outCitations: ["b3b1144bc9029349ec19fdb37acd1b077130e3ac"],
        title: "Commentary—District decision-making",
        venue: "Health policy and planning",
        year: 2016
      },
      {
        _id: "59f5d5b6dfa15819497e8b64",
        authors: [{ ids: ["2978859"], name: "Lorenzo Villarroel" }],
        id: "82b5dcc4cd85f04fb16027880735c0ebe1fa817c",
        inCitations: ["c2ed14a38d555bb912496d79909c89174b603bb2", "b54e8a66a5641485fd04178eaab4bdaec16f9190"],
        keyPhrases: ["APP"],
        outCitations: [],
        title: "Release planning of mobile apps based on user reviews",
        venue: "ICSE",
        year: 2016
      },
      {
        _id: "59f5d5b6dfa15819497e8b77",
        authors: [{ ids: [], name: "Rahmatollah Marzband" }],
        id: "82ddf6b6c2930970dc9469118b0893f5ad12dfa5",
        inCitations: [],
        keyPhrases: ["Spiritual Care"],
        outCitations: ["41ff0ca947d6e03bd56fb82bce51edfe3bcbcc0d"],
        title: "A Concept Analysis",
        venue: "",
        year: 2016
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/top-X-of-Y?topN=1&y=year&value=2016")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("topN");
        res.body.topN.should.equal("1");
        res.body.should.have.property("y");
        res.body.y.should.equal("year");
        res.body.should.have.property("value");
        res.body.value.should.equal("2016");

        res.body.should.have.property("results");
        res.body.results.length.should.equal(1);

        res.body.results[0].should.have.property("x");
        res.body.results[0].x.should.have.property("title");
        res.body.results[0].x.title.should.equal("Proportional Borda allocations");
        res.body.results[0].should.have.property("count");
        res.body.results[0].count.should.equal(4);

        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [
      {
        _id: "59f5d5b5dfa15819497e5fe4",
        keyPhrases: ["MNO", "CYS", "HPV", "TEM", "Ctivity"]
      },
      {
        _id: "59f5d5b6dfa15819497e7637",
        keyPhrases: ["3D Face", "GST", "2D Face Images", "Arbitrary View", "Regressor"]
      },
      {
        _id: "59f5d5b6dfa15819497e8724",
        keyPhrases: ["MHH", "Pub/sub", "HPV", "Broker", "Subscriber"]
      },
      {
        _id: "59f5d5b6dfa15819497e8aa7",
        keyPhrases: ["HPV", "GST", "Relay"]
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/top-X-of-Y?topN=3&y=authors&value=Jing Li&x=keyphrase")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("topN");
        res.body.topN.should.equal("3");
        res.body.should.have.property("x");
        res.body.x.should.equal("keyphrase");
        res.body.should.have.property("y");
        res.body.y.should.equal("authors");
        res.body.should.have.property("value");
        res.body.value.should.equal("Jing Li");

        res.body.should.have.property("results");
        res.body.results.length.should.equal(3);

        res.body.results[0].should.have.property("x");
        res.body.results[0].x.should.have.property("keyPhrase");
        res.body.results[0].x.keyPhrase.should.equal("HPV");
        res.body.results[0].should.have.property("count");
        res.body.results[0].count.should.equal(3);

        res.body.results[1].should.have.property("x");
        res.body.results[1].x.should.have.property("keyPhrase");
        res.body.results[1].x.keyPhrase.should.equal("GST");
        res.body.results[1].should.have.property("count");
        res.body.results[1].count.should.equal(2);

        res.body.results[2].should.have.property("x");
        res.body.results[2].x.should.have.property("keyPhrase");
        res.body.results[2].x.keyPhrase.should.equal("2D Face Images");
        res.body.results[2].should.have.property("count");
        res.body.results[2].count.should.equal(1);

        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [
      {
        _id: "59f5d5a9dfa15819497ce9b0",
        authors: [{ ids: ["2200197"], name: "Yingda Chen" },
          { ids: ["3212767"], name: "Shalinee Kishore" },
          { ids: ["1742253"], name: "Jing Li" }]
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/top-X-of-Y?topN=3&y=paper&value=Wireless diversity through network coding&x=authors")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");

        res.body.should.have.property("topN");
        res.body.topN.should.equal("3");
        res.body.should.have.property("x");
        res.body.x.should.equal("authors");
        res.body.should.have.property("y");
        res.body.y.should.equal("paper");
        res.body.should.have.property("value");
        res.body.value.should.equal("Wireless diversity through network coding");

        res.body.should.have.property("results");
        res.body.results.length.should.equal(3);

        res.body.results[0].should.have.property("x");
        res.body.results[0].x.should.have.property("ids");
        res.body.results[0].x.ids[0].should.equal("1742253");
        res.body.results[0].x.should.have.property("name");
        res.body.results[0].x.name.should.equal("Jing Li");
        res.body.results[0].should.have.property("count");
        res.body.results[0].count.should.equal(1);

        res.body.results[1].should.have.property("x");
        res.body.results[1].x.should.have.property("ids");
        res.body.results[1].x.ids[0].should.equal("2200197");
        res.body.results[1].x.should.have.property("name");
        res.body.results[1].x.name.should.equal("Yingda Chen");
        res.body.results[1].should.have.property("count");
        res.body.results[1].count.should.equal(1);

        res.body.results[2].should.have.property("x");
        res.body.results[2].x.should.have.property("ids");
        res.body.results[2].x.ids[0].should.equal("3212767");
        res.body.results[2].x.should.have.property("name");
        res.body.results[2].x.name.should.equal("Shalinee Kishore");
        res.body.results[2].should.have.property("count");
        res.body.results[2].count.should.equal(1);

        done();
      });
  });
});

after(done => {
  mongoose.connection.close();
  done();
});
