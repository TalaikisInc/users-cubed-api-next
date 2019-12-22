const expect = require('chai').expect
const sinon = require('sinon')
const { describe, it, before, after, context } = require('mocha')

const asyncConcatService = require("../../../lib/asyncConcatService");
let asyncConcat = require("../../../functions/asyncConcat");

describe('asyncConcat', function asyncConcatTest() {
  let concatStub;

  context('input ok', function () {
    let queryStringParameters = { a: "a string", b: "b string" };
    let result = "result stub";

    before(function beforeTest() {
      concatStub = sinon.stub(asyncConcatService, "concat");
      concatStub.callsFake(function (a, b) {
        expect(a).to.eq(queryStringParameters.a);
        expect(b).to.eq(queryStringParameters.b);

        return Promise.resolve(result);
      });
    });

    it('success', async function () {
      let event = { queryStringParameters };
      let context = {};

      let response = await asyncConcat.handler(event, context);

      expect(response.statusCode).to.eq(200);
      expect(response.body).to.eq(`{"result":"${result}"}`);
    });

    after(function afterTest() {
      concatStub.restore();
    });
  });

  context('input missing', function () {
    let queryStringParameters = { a: "a string" };

    it('failure', async function () {
      let event = { queryStringParameters };
      let context = {};

      let response = await asyncConcat.handler(event, context);

      expect(response.statusCode).to.eq(400);
      expect(response.body).to.eq('{"message":"Please specify 2 strings a and b to concatenate"}');
    });

    after(function afterTest () {
      concatStub.restore()
    })
  })
})
/*
const { spawn } = require('child_process');
const getSlsOfflinePort = require('./support/getSlsOfflinePort');

let slsOfflineProcess;

before(function (done) {
  // increase mocha timeout for this hook to allow sls offline to start
  this.timeout(30000);

  console.log("[Tests Bootstrap] Start");

  startSlsOffline(function (err) {
    if (err) {
      return done(err);
    }

    console.log("[Tests Bootstrap] Done");
    done();
  })
});

after(function () {
  console.log("[Tests Teardown] Start");

  stopSlsOffline();

  console.log("[Tests Teardown] Done");
});


// Helper functions

function startSlsOffline(done) {
  slsOfflineProcess = spawn("sls", ["offline", "start", "--port", getSlsOfflinePort()]);

  console.log(`Serverless: Offline started with PID : ${slsOfflineProcess.pid}`);

  slsOfflineProcess.stdout.on('data', (data) => {
    if (data.includes("Offline listening on")) {
      console.log(data.toString().trim());
      done();
    }
  });

  slsOfflineProcess.stderr.on('data', (errData) => {
    console.log(`Error starting Serverless Offline:\n${errData}`);
    done(errData);
  });
}


function stopSlsOffline() {
  slsOfflineProcess.kill();
  console.log("Serverless Offline stopped");
}

const request = require('supertest');
const expect = require('chai').expect;
const getSlsOfflinePort = require('../support/getSlsOfflinePort');

describe('getAsyncConcat', function getAsyncConcatTest() {

  it('ok', function it(done) {
    request(`http://localhost:${getSlsOfflinePort()}`)
      .get(`/asyncConcat?a=it&b=works`)
      .expect(200)
      .end(function (error, result) {
        if (error) {
          return done(error);
        }

        expect(result.body.result).to.deep.eq("it works");
        done();
      });
  });

});
*/
