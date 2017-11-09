module.exports = function(params) {
  let { chai, chaiHttp, server, should, expect } = params;
  describe("test connection", () => {
    describe("/GET autocomplete", () => {
      it("it should return hello world", function(done) {
        chai
          .request(server)
          .get("/")
          .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.be.json;
            expect(JSON.parse(res.text).msg).to.equal("hello world");
            done();
          });
      });
    });
  });
};
