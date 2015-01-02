/**
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 * 
 *  This file is part of opendispatcher
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

/**
 * 
 * @param {type} req
 * @param {type} res
 * @returns {json}
 */
exports.getOrganisation = function(req, res) {
    //where identificatie = 1369659645
    if (req.query) {
        id = req.params.id;
        srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "organisation" from organisation.organisation_json($1)';
        global.pool.query(query_str, [srid],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    res.json(result.rows[0]);
                }
                return;
            }
        );
    }
};

exports.postAnnotation = function(req, res) {
    var point = 'POINT(' + parseFloat(req.body.geometry.coordinates[0]) + ' '+ parseFloat(req.body.geometry.coordinates[1]) + ')';
    //console.log(point);
    var query_str = 'insert into organisation.annotation (subject, name, email, '+ 
        'municipality, place, address, phone, remarks, permalink, the_geom) values ($1, $2, $3, $4, $5, $6, $7, $8, ST_transform(ST_PointFromText($9, $10),4326))';
    global.pool.query(query_str, [req.body.subject, req.body.name, req.body.email, 
        req.body.municipality, req.body.place, req.body.address, req.body.phone, req.body.remarks, req.body.permalink, point, req.body.srid],
        function(err, result){
            if(err) {
                res.json(err);
            } else {
                res.json({"result":"ok"});
            }
            return;
        }
    );
    
};

exports.getObject = function(req, res) {
    //where identificatie = 1369659645
    if (req.query) {
        id = req.params.id;
        srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "DBKObject" from dbk.dbkobject_json($1,$2)';
        global.pool.query(query_str, [id, srid],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    res.json(result.rows[0]);
                }
                return;
            }
        );
    }
};

exports.getGebied = function(req, res) {
    //where identificatie = 1369659645
    if (req.query) {
        id = req.params.id;
        srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "DBKGebied" from dbk.dbkgebied_json($1,$2)';
        global.pool.query(query_str, [id, srid],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    res.json(result.rows[0]);
                }
                return;
            }
        );
    }
};
exports.getFeatures = function(req, res) {
    //where identificatie = 1369659645
    if (req.query) {
        srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select "feature" from dbk.dbkfeatures_json($1)';
        global.pool.query(query_str, [srid],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    var resultset = {"type": "FeatureCollection", "features": []};
                    
                    for (index = 0; index < result.rows.length; ++index) {
                        var item = {type: 'Feature', id: 'DBKFeature.gid-' + result.rows[index].feature.gid};
                        item.geometry = result.rows[index].feature.geometry;
                        item.properties = result.rows[index].feature;
                        delete item.properties.geometry;
                        resultset.features.push(item);
                    }
                    res.json(resultset);
                }
                return;
            }
        );
    }
};
