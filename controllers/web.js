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

/* global exports, require, global */

exports.validate_GET = function(req, res) {
    var token = req.params.token;
    checkToken(token, res);
};

exports.validate_POST = function(req, res) {
    var token = req.body.token;
    checkToken(token, res);
};

checkToken = function(token, res) {
    if (token === "be8c631496af73e302c0effec301dfda7ffd11fa1c2e08ae") {

        res.render('error', {title: 'Welkom!', error: 'Hallo Milo!'});
    } else {
        require('crypto').randomBytes(24, function(ex, buf) {
            var newtoken = buf.toString('hex');
            if (newtoken === token) {
                res.render('error', {title: 'Yeah!', error: 'Goed zo!'});
            } else {
                res.status(500);
                res.render('error', {title: 'Fout', error: token + ' is niet gelijk aan ' + newtoken});
            }
        });
    }
};
exports.getData = function(req, res) {
    if (req.query) {
        id = req.params.id;
        var query_str = 'select gid from web.user where uuid = $1';
        global.pool.query(query_str, [id],
            function(err, result) {
                if (err) {
                    res.json({"Unauthorized": "No corresponding user found"});
                } else {
                    if(result.rows.length > 0){
                        //console.log(result);
                        //res.json({"boo": "bah"});
                        req.params.uuid = result.rows[0].gid;
                        getJSON(req, res);
                    } else {
                        res.status(401);
                        res.json({"Unauthorized": "No corresponding user found"});
                    }
                }
                return;
            }
        );
    }
};
getJSON = function(req, res) {
    if (req.query) {
        id = req.params.uuid;
        srid = req.query.srid;
        if (!srid) {
            srid = 4326;
        }
        var query_str = 'select * from web.data_json($1,$2)';
        global.pool.query(query_str, [id, srid],
            function(err, result) {
                if (err) {
                    res.status(400).json(err);
                } else {
                    var resultset = {};
                    for (index = 0; index < result.rows.length; ++index) {
                        resultset[result.rows[index].name] = result.rows[index].data;
                        if (!resultset[result.rows[index].name].fields) {
                            delete resultset[result.rows[index].name].fields;
                        }
                        if (!resultset[result.rows[index].name].functions) {
                            delete resultset[result.rows[index].name].functions;
                        }
                        if (!resultset[result.rows[index].name].features) {
                            delete resultset[result.rows[index].name].features;
                        }
                        //delete resultset[result.rows[index].name].name;
                    }
                    res.json(resultset);
                }
                return;
            }
        );
    }
};