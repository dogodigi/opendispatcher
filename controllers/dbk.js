/**
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

/**
 * Get the settings for the organisation from the database based on
 * the database connection defined in config.json or config.default.json
 *
 * @param {type} req
 * @param {type} res
 * @returns organisation settings for the application
 */
exports.getOrganisation = function(req, res) {
    if (req.query) {
        var srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "organisation" from organisation.organisation_json($1)';
        global.pool.query(query_str, [srid],
            function(err, result){
                if(err) {
                    res.status(400).json(err);
                } else {
                    res.json(removeNulls(result.rows[0]));
                }
                return;
            }
        );
    }
};

/**
 * Select an object from the database by id. takes srid as parameter.
 * If srid is undefined, falls back to WGS84
 *
 * @param {type} req
 * @param {type} res
 * @returns object
 */
exports.getObject = function(req, res) {
    if (req.query) {
        var id = req.params.id;
        var srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "DBKObject" from dbk.dbkobject_json($1,$2)';
        global.pool.query(query_str, [id, srid],
            function(err, result){
                if(err) {
                    res.status(400).json(err);
                } else {
                    res.json(removeNulls(result.rows[0]));
                }
                return;
            }
        );
    }
};

exports.getGebied = function(req, res) {
    if (req.query) {
        var id = req.params.id;
        var srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "DBKGebied" from dbk.dbkgebied_json($1,$2)';
        global.pool.query(query_str, [id, srid],
            function(err, result){
                if(err) {
                    res.status(400).json(err);
                } else {
                    res.json(removeNulls(result.rows[0]));
                }
                return;
            }
        );
    }
};

exports.getFeatures = function(req, res) {
    if (req.query) {
        var srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "feature" from dbk.dbkfeatures_json($1)';
        global.pool.query(query_str, [srid],
            function(err, result){
                if(err) {
                    res.status(400).json(err);
                } else {
                    var resultset = {"type": "FeatureCollection", "features": []};

                    for (var i = 0; i < result.rows.length; ++i) {
                        var item = {type: 'Feature', id: 'DBKFeature.gid--' + result.rows[i].feature.gid};
                        item.geometry = result.rows[i].feature.geometry;
                        item.properties = result.rows[i].feature;
                        delete item.properties.geometry;
                        resultset.features.push(item);
                    }
                    res.json(removeNulls(resultset));
                }
                return;
            }
        );
    }
};

/**
 * Compact arrays with null entries; delete keys from objects with null value
 *
 * @param {json} data
 * @returns data with nulls removed.
 */
var removeNulls = function(data){
  var y;
  for (var x in data) {
    y = data[x];
    if (y==="null" || y===null || y==="" || typeof y === "undefined" || (y instanceof Object && Object.keys(y).length === 0)) {
      delete data[x];
    }
    if (y instanceof Object) y = removeNulls(y);
  }
  return data;
};
