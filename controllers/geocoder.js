/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of opendispatcher/safetymapsDBK
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global exports, global */
var express = require('express');
var router = express.Router();
var http = require('http');
var querystring = require('querystring');

router.route('/mapzen')
  .all( function (req, res) {
    if (req.query) {
        var request = require('request');
        req.query.api_key = 'search-Mm6BEtE';

        var x = request({url: 'https://search.mapzen.com/v1/autocomplete', qs: req.query});
        x.on('response', function(response) {
          var data = [];
          response.on('data', function(chunk) {
            data.push(chunk);
          });
          response.on('end', function() {
            var finaldata = data.join('');
            var result = JSON.parse(finaldata);
            res.json(result.features);
          });
        });
        x.on('error', function(err) {
          res.status(400).json({
            "error": "Timeout on proxy"
          });
        });
    } else {
        res.json({"booh": "Nah, nah, nah! You didn't say the magic words!"});
    }
  });

router.route('/nominatim')
  .all( function (req, res) {
    if (req.query) {
        var request = require('request');
        var x = request({url: 'http://nominatim.openstreetmap.org/search', qs: req.query});
        req.pipe(x);
        x.pipe(res);
    } else {
        res.json({"booh": "Nah, nah, nah! You didn't say the magic words!"});
    }
  });

function isJsonNull(val) {
    if (val === "null" || val === null || val === "" || typeof(val) === "undefined") {
        return true;
    } else {
        return false;
    }
}
function constructFeature(row) {
    var result = {};
    if (!isJsonNull(row.place_id)) {
        result.id = row.place_id;
        result.name = '';
        result.type = 'address';
        result.properties = {};
        if (!isJsonNull(row.display_name)) {
            result.name += row.display_name;
        }
        if (!isJsonNull(row.lon) && !isJsonNull(row.lat)) {
            result.geometry = {type: "Point", coordinates: [parseFloat(row.lon), parseFloat(row.lat)]};
            result.geometry.crs = {"type": "name", "properties": {"name": "urn:ogc:def:crs:EPSG::4326"}};
        }

        if (!isJsonNull(row.address)) {
            result.properties = row.address;
        }
        result.properties.source = { provider: 'openstreetmap'};
        if (!isJsonNull(row.osm_type)) {
            result.properties.source.type = row.osm_type;
        }
        if (!isJsonNull(row.osm_id)) {
            result.properties.source.id = row.osm_id;
        }
        if (!isJsonNull(row.licence)) {
            result.properties.license = row.licence;
        } else {
            result.properties.license = 'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright';
        }
        if (!isJsonNull(row.class)) {
            result.properties.source.class = row.class;
        }
        if (!isJsonNull(row.type)) {
            result.properties.source.type = row.type;
        }
    }
    result.name.trim();
    return result;
}

/**
 * Geocode - Pass a query to nominatim and process the result
 * see <http://wiki.openstreetmap.org/wiki/Nominatim#Search>
 *
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
function geocode (req, res) {
    var queryparams = req.query;
    queryparams['accept-language'] = req.headers["accept-language"].substring(0, 2);
    var bbox = '-180,90,180,-90';
    queryparams.format = "json";
    queryparams.bounded = 1;
    queryparams.limit = 5;
    queryparams.addressdetails = 1;
    queryparams.viewbox = bbox;
    queryparams.time = new Date().getTime();
    queryparams.email = 'nominatim@dogodigi.net';
    if (!isJsonNull(req.params.q)) {
        queryparams.q = req.params.q;
    } else if (!isJsonNull(req.params.country)) {
        queryparams.country = req.params.country;
    }
    //http://open.mapquestapi.com/nominatim/v1/search?
    //http://nominatim.openstreetmap.org/search?
    var options = {
        //host: 'nominatim.openstreetmap.org',
        host: 'open.mapquestapi.com',
        port: 80,
        //path: '/search?' + querystring.stringify(queryparams)
        path: '/nominatim/v1/search?' + querystring.stringify(queryparams)
    };
    console.log(options.path);
    http.get (options, function (remote_res) {
        var mybuf = '';
        remote_res.on('error', function (e) {
            throw e;
        });
        remote_res.on('data', function (chunk) {
            mybuf += chunk;
        });
        remote_res.on('end', function () {
            if (remote_res.headers['content-type'].indexOf('json') > -1) {
                myResult = JSON.parse(mybuf);
                if (myResult.length > 0) {
                    var dataset = [];
                    for (var p = 0; p < myResult.length; ++p) {
                        var Feature = constructFeature(myResult[p]);
                        dataset.push(Feature);
                    }
                    res.json(dataset);
                } else {
                    res.send([]);
                }
            } else {
                res.json([]);
            }
        });
        return;
    });
}

/**
 * Reverse - Pass coordinates to nominatim and process the result
 * see <http://wiki.openstreetmap.org/wiki/Nominatim#Reverse_Geocoding_.2F_Address_lookup>
 *
 *
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
function reversegeocode (req, res) {
    if (isJsonNull(req.params.lonlat)) {
        res.send([]);
    } else {
        var queryparams = req.query;
        queryparams.format = 'json';
        if (isJsonNull(queryparams.zoom)) {
            queryparams.zoom = 18;
        } else {
            queryparams.zoom = parseInt(queryparams.zoom) + 1;
        }
        //queryparams.polygon = 0;
        queryparams.addressdetails = 1;
        //queryparams.limit = 1;
        queryparams.email = 'nominatim@dogodigi.net';
        queryparams['accept-language'] = req.headers["accept-language"].substring(0, 2);
        var lonlat = req.params.lonlat.split(' ');
        queryparams.lon = parseFloat(lonlat[0]);
        queryparams.lat = parseFloat(lonlat[1]);
        queryparams.time = new Date().getTime();

        //http://open.mapquestapi.com/nominatim/v1/reverse?
        //http://nominatim.openstreetmap.org/reverse?
        var options = {
            //host: 'nominatim.openstreetmap.org',
            host: 'open.mapquestapi.com',
            port: 80,
            //path: '/reverse?' + querystring.stringify(queryparams)
            path: '/nominatim/v1/reverse?' + querystring.stringify(queryparams)
        };
        //console.log(options.path);
        http.get(options, function (remote_res) {
            var mybuf = '';
            remote_res.on('error', function (e) {
                throw e;
            });
            remote_res.on('data', function (chunk) {
                mybuf += chunk;
            });
            remote_res.on('end', function () {
                if (remote_res.headers['content-type'].indexOf('json') > -1) {
                    myResult = JSON.parse(mybuf);
                    var Feature = constructFeature(myResult);
                    res.json([Feature]);
                } else {
                    res.send([]);
                }
            });
            return;
        });
    }
}
module.exports = router;
