/**
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 * 
 *  This file is part of safetymapDBK
 *  
 *  safetymapDBK is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  safetymapDBK is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 *
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
        'municipality, place, address, phone, remarks, permalink, the_geom) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_transform(ST_PointFromText($10, $11),4326))';
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

exports.mailAnnotation = function(req, res) {

    var nodemailer = require("nodemailer");
    var smtp = nodemailer.createTransport({host: global.conf.get('support:smtp'), ignoreTLS: true});

    var search = global.conf.get('support:linkreplace:search');
    var replacement = global.conf.get('support:linkreplace:replacement');

    var link = req.body.permalink;
    if(search && replacement) {
        var link = link.replace(new RegExp(search), replacement);
    };

    var htmltemplate = 'Er is een melding gedaan over een fout in de kaart:<br/><br/>' +
        '<table>' +
                '<tr><th>Adres:</th><td>' + req.body.address + '</td></tr>' +
                '<tr><th>Onderwerp:</th><td>' + req.body.subject + '</td></tr>' +
                '<tr><th>Melding:</th><td><pre>' + req.body.remarks + '</pre></td></tr>' +
                '<tr><td colspan="2"><hr /><td></tr>' +
                '<tr><th>Melder:</th><td>' + req.body.name + '</td></tr>' +
                '<tr><th>Email:</th><td>' + req.body.email + '</td></tr>' +
                '<tr><th>Telefoon:</th><td>' + req.body.phone + '</td></tr>' +
                '<tr><td colspan="2"><hr /><td></tr>' +
                '<tr><td colspan="2">Klik op de link om de melding te openen:</td></tr>' +
                '<tr><td colspan="2"><a href="' + link + '">'  + link + '</td></tr><br/><br/>' +
        '<br/><br/>';
    smtp.sendMail({
        from: global.conf.get('support:from'),
        to: global.conf.get('support:sendto') + ',' + req.body.email,
        subject: 'Melding fout in de kaart',
        html: htmltemplate
    }, function(error, response) {
        smtp.close();
        if (error) {
            console.log("Mail error", error);
            res.json(err);
        } else {
            res.json({"result":"ok"});
        }
    });
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
                        var item = {type: 'Feature', id: 'DBKFeature.gid--' + result.rows[index].feature.gid};
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
