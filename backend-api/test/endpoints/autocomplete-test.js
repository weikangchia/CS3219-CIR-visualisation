module.exports = function (options) {
  const {
    sinon,
    chai,
    chaiHttp,
    mongoose,
    server,
    commonErrorResponse
  } = options;

  const {
    invalidField,
    invalidDomain
  } = commonErrorResponse;

  let Paper;
  beforeEach(() => {
    Paper = mongoose.connection.model("Paper");
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
};
