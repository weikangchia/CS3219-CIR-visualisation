process.env.NODE_ENV = "test";
process.env.PORT = 3001;

const chai = require("chai");
const chaiHttp = require("chai-http");

const server = require("../app");

const should = chai.should();

chai.use(chaiHttp);

describe("/GET index", () => {
  it("it should GET a JSON object containing hello world message", done => {
    chai.request(server).get("/").end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.a("object");
      res.body.should.have.property("message");
      res.body.message.should.equal("hello world");
      done();
    });
  });
});
