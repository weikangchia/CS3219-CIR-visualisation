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
    invalidField
  } = commonErrorResponse;

  let Paper;
  beforeEach(() => {
    Paper = mongoose.connection.model("Paper");
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
};
