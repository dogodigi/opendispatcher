var request = require('supertest');
var assert = require('assert');
var server = require('../server');

describe('BAG API test', function () {
    describe('/api/bag/info', function () {
        it('/api/bag/info 200', function (done) {
            request(server.app).get('/api/bag/info').expect(200).end(function (err, res) {
                if (err) {
                    done(err);
                } else {
                    console.log("RES:\n", res.header);
                    res.header.should.have.property('location', '/login');
                    done();
                }
            });
            ;
        });
    });
    describe('/api/bag/adres/1', function () {
        it('/api/bag/adres/1 200', function (done) {
            request(server.app).get('/api/bag/adres/1').expect(200, done);
        });
    });
//    describe('/api/bag/panden/1', function () {
//        it('/api/bag/panden/1 200', function (done) {
//            request(server.app).get('/api/bag/panden/1').expect(200, done).end(done);
//        });
//    });
    describe('/api/bag/panden/1.json?iam=dummy', function () {
        it('/api/bag/panden/1 200', function (done) {
            request(server.app).get('/api/bag/panden/1.json?iam=dummy').expect(200, done);
        });
    });
    describe('/api/bag/autocomplete/beukenla', function () {
        it('/api/bag/autocomplete/beukenla 200', function (done) {
            request(server.app).get('/api/bag/autocomplete/beukenla').expect(200, done);
        });
    });
});