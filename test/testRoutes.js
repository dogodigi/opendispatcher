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
var request = require('supertest'),
  server = require('../server.js'),
  assert = require('assert');

server.app.set('env', 'production');

describe('Routes:', function() {
  it('GET Index', function(done) {
    // See that we get a status 200 on retrieving the Index
    server.app.set('env', 'production');
    request(server.app).get('/')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200, done);
  });
  it('GET organisation', function(done){
    request(server.app).get('/api/organisation.json')
      .expect(200)
      .end( function (err, response){
        if (err) throw err;
        //assert.equal()
        //console.log(result);
        done();
      });
  });
  it('GET features', function(done){
    request(server.app).get('/api/features.json')
      .expect(200)
      .end( function (err, response){
        if (err) throw err;
        try {
          var result = response.body;
          var testFeature = result.features[0];
          if (testFeature){
            assert.equal(typeof(testFeature), "object","Single row from Features should be an object");
            assert.equal(testFeature.type, "Feature","Single row from Features should have \"type\" set to \"feature\"");
            assert.equal(typeof(testFeature.geometry), "object","Single row from Features needs to have geometry");
            assert.equal(typeof(testFeature.properties), "object","Single row from Features needs to have properties");
          } else {
            //force test to fail
            assert.equal(typeof(testFeature), "object","Test Feature should be an object");
          }
          //assert.equal()
          //console.log(result);
          done();
        } catch (e) {
          done(e);
        }
      });
  });
  it('Get Feature', function(done){
    request(server.app).get('/api/object/1.json')
      .expect(200)
      .end( function (err, response){
        if (err) throw err;
        try {
          var result = response.body;
          assert.equal(!result.DBKObject, false, 'Should return A DBKObject');
          var testFeature = result.DBKObject;
          if(testFeature){
            assert.equal(typeof(testFeature), "object","Test Feature should be an object");
            assert.equal(testFeature.identificatie, 1,"identifier should be 1");
          } else {
            assert.equal(typeof(testFeature), "object","Test Feature should be an object");
          }
          done();
        } catch (e) {
          done(e);
        }
      });
  });
  it('Get Area', function(done){
    request(server.app).get('/api/gebied/2.json')
      .expect(200)
      .end( function (err, response){
        if (err) throw err;
        try {
          var result = response.body;
          assert.equal(response.statusCode, 200, '/api/gebied/2.json is not available');
          assert.equal(!result.DBKGebied, false, 'Should return A DBKGebied');
          var testFeature = result.DBKGebied;
          if(testFeature){
            assert.equal(typeof(testFeature), "object","Test Feature should be an object");
            assert.equal(testFeature.identificatie, 2,"identifier should be 2");
          } else {
            assert.equal(typeof(testFeature), "object","Test Feature should be an object");
          }
          done();
        } catch (e) {
          done(e);
        }
      });
  });
});
