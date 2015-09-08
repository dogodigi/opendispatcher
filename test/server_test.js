var request = require('nodeunit-express');
var server = require('../server');

var express = request(server.app);
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
            var testFeature = result.features[0];
            if(testFeature){
                test.equal(typeof(testFeature), "object","Single row from Features should be an object");
                test.equal(testFeature.type, "Feature","Single row from Features should have \"type\" set to \"feature\"");
                test.equal(typeof(testFeature.geometry), "object","Single row from Features needs to have geometry");
                test.equal(typeof(testFeature.properties), "object","Single row from Features needs to have properties");
            } else {
                test.equal(typeof(testFeature), "object","Test Feature should be an object");
            }
            test.done();
        });
    },
    "/api/object/1.json": function (test) {
        express.get('/api/object/1.json').expect(function (response) {
            // response is the response from hitting '/'
            var result = JSON.parse(response.body);
            test.equal(response.statusCode, 200, '/api/object/1.json is not available');
            test.equal(!result.DBKObject, false, 'Should return A DBKObject');
            var testFeature = result.DBKObject;
            if(testFeature){
                test.equal(typeof(testFeature), "object","Test Feature should be an object");
                test.equal(testFeature.identificatie, 1,"identifier should be 1");
            } else {
                test.equal(typeof(testFeature), "object","Test Feature should be an object");
            }
            test.done();
        });
    },
    "/api/gebied/2.json": function (test) {
        express.get('/api/gebied/2.json').expect(function (response) {
            // response is the response from hitting '/'
            var result = JSON.parse(response.body);
            test.equal(response.statusCode, 200, '/api/object/1.json is not available');
            test.equal(!result.DBKGebied, false, 'Should return A DBKGebied');
            var testFeature = result.DBKGebied;
            if(testFeature){
                test.equal(typeof(testFeature), "object","Test Feature should be an object");
                test.equal(testFeature.identificatie, 2,"identifier should be 2");
            } else {
                test.equal(typeof(testFeature), "object","Test Feature should be an object");
            }
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