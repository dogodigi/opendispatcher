/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of opendispatcher
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  parcelsplopendispatcheritter is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */
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
