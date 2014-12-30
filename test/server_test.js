var request = require('nodeunit-express');
var server = require('../server');

var express = request(server.app);
exports["Rest interfaces"] = {
    setUp: function (callback) {
        //insert some stuff in the database?
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
            test.equal(response.statusCode, 200, '/api/organisation is not available');
            test.equal(!result.organisation, false, 'Organisation should be returned');
            test.done();
        });
    },
    "/api/features.json": function (test) {
        express.get('/api/features.json').expect(function (response) {
            // response is the response from hitting '/'
            var result = JSON.parse(response.body);
            test.equal(response.statusCode, 200, '/api/features.json is not available');
            test.equal(!result.features, false, 'Features should be returned');
            console.log(result);
            var testFeature = result.features[0];
            test.equal(typeof(testFeature), "object","Test Feature should be an object");
            test.equal(testFeature.type, "Feature","Test Feature should have \"type\" set to \"feature\"");
            test.equal(typeof(testFeature.geometry), "object","Test Feature needs to have geometry");
            test.equal(typeof(testFeature.properties), "object","Test Feature needs to have properties");
            test.done();
        });
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