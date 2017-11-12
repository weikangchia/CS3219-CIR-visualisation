module.exports = function (options) {
  const {
    sinon,
    chai,
    chaiHttp,
    server
  } = options;

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
};
