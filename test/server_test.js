var request = require('nodeunit-express');
// require the express application, notice how we exported the express app using `module.exports` above
var server = require('../server');

var express = request(server.app);
var testFeature;
exports["Rest interfaces"] = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },
    "/": function (test) {
        express.get('/').expect(function (response) {
            // response is the response from hitting '/'
            test.equal(response.statusCode, 200);
            test.done();
        });
    },
    "/api/organisation.json": function (test) {
        express.get('/api/organisation.json').expect(function (response) {
            // response is the response from hitting '/'
            var result = JSON.parse(response.body);
            test.equal(response.statusCode, 200);
            test.equal(!result.organisation, false, 'Organisation should be returned');
            test.done();
        });
    },
    "/api/features.json": function (test) {
        express.get('/api/features.json').expect(function (response) {
            // response is the response from hitting '/'
            var result = JSON.parse(response.body);

            test.equal(response.statusCode, 200);
            test.equal(!result.features, false, 'Features should be returned');
            testFeature = result.features[0];
            test.done();
        });
    },
    "Test a feature": function (test) {
        //We use the feature created from features.json
        console.log(testFeature);
        test.equal(typeof(testFeature), "object","Test Feature should be an object");
        test.equal(testFeature.type, "Feature","Test Feature should have \"type\" set to \"feature\"");
        test.equal(typeof(testFeature.geometry), "object","Test Feature needs to have geometry");
        test.equal(typeof(testFeature.properties), "object","Test Feature needs to have properties");
        test.done();
    },
    finalize: function (test) {
        
        test.ok(true, 'Database connection pool could not be closed');
        test.done();
        //don't forget to close the database!
        cleanup();

    }
};
function cleanup() {
    //wait a little
    setTimeout(function () {
        server.pool.close();
        server.bag.close();
        express.close();
    }, 500);
}