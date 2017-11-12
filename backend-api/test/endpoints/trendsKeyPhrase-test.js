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
};
