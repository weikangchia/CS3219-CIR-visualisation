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
    const expectedResult = [
      {
        id: 123,
        authors: [{
          ids: 456,
          name: "jack"
        }]
      },
      {
        id: 234,
        authors: [{
          ids: [456],
          name: "jack"
        }, {
          ids: [789],
          name: "mary"
        }]
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/graphs/coauthors?author=jack")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [
      {
        id: 123,
        authors: [{
          ids: [456],
          name: "jack"
        }]
      },
      {
        id: 456,
        authors: [{
          ids: [789],
          name: "mary"
        }]
      }
    ];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/graphs/coauthors?author=jack")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      });
  });

  it("it should return 200", done => {
    const expectedResult = [];

    Paper.find.yields(null, expectedResult);

    chai
      .request(server)
      .get("/graphs/coauthors?author=jack")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object");
        done();
      });
  });
};
