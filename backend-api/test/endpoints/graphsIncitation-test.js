module.exports = function (options) {
  const {
    sinon,
    chai,
    chaiHttp,
    mongoose,
    server
  } = options;

  const invalidFieldCode = 400;
  const invalidFieldMessage = "Missing field/invalid field.";

  let Paper;
  beforeEach(() => {
    Paper = mongoose.connection.model("Paper");
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
};
