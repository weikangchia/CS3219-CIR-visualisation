module.exports = function(params) {
  let { chai, chaiHttp, server, should } = params;
  describe("autocomplete", () => {
    describe("/GET autocomplete", () => {
      it("it should return some results", function(done) {
        this.timeout(5000);
        chai
          .request(server)
          .get("/autocomplete?search=a&domain=authors")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.gt(0);
            done();
          });
      });
    });
  });
};
