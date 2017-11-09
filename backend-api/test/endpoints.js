//During the test the env variable is set to test
process.env.NODE_ENV = "test";
process.env.PORT = 3001;

let mongoose = require("mongoose");

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
let should = chai.should();
let expect = chai.expect

chai.use(chaiHttp);

const tests = [
  require('./endpoints/test'),
  require('./endpoints/autocomplete')
]

tests.forEach(test => {
  test({
    chai,
    chaiHttp,
    server,
    should,
    expect
  })
})
