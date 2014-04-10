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

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

exports.getAdres = function(req, res) {
    //console.log(req);
    //where adresseerbaarobject = 14200010788752
    
    if (req.query) {
        id = req.params.id;
        srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        //var query_str = 'select * from "dbk"."DBKObject_Feature" d JOIN (select * from "dbk"."type_aanwezigheidsgroep") t   ;';
        var query_str = 'select a.openbareruimtenaam, a.huisnummer, a.huisletter, a.huisnummertoevoeging, a.postcode, a.woonplaatsnaam, ' + 
                'a.gemeentenaam, a.provincienaam, a.typeadresseerbaarobject, a.adresseerbaarobject, a.nummeraanduiding, a.nevenadres, ' + 
                'st_asgeojson(st_force2d(st_transform(a.geopunt,$2))) geopunt, vp.gerelateerdpand as pand '+ 
                'from bag8jan2014.adres a left join bag8jan2014.verblijfsobjectpand vp on a.adresseerbaarobject = vp.identificatie ' + 
                'where a.adresseerbaarobject = $1';
        global.bag.query(query_str, [id,srid],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    for (index = 0; index < result.rows.length; ++index) {
                        var geometry = JSON.parse(result.rows[index].geopunt);
                        delete result.rows[index].geopunt;
                        result.rows[index].geometry = geometry;
                        result.rows[index].type = "Feature";
                        result.rows[index].properties = {};
                        result.rows[index].properties.gid = result.rows[index].nummeraanduiding;
                        result.rows[index].properties.nummeraanduiding = result.rows[index].nummeraanduiding;
                        delete result.rows[index].nummeraanduiding;
                        result.rows[index].properties.openbareruimtenaam = result.rows[index].openbareruimtenaam;
                        delete result.rows[index].openbareruimtenaam;
                        result.rows[index].properties.pand = result.rows[index].pand;
                        delete result.rows[index].pand;
                        result.rows[index].properties.huisnummer = result.rows[index].huisnummer;
                        delete result.rows[index].huisnummer;
                        result.rows[index].properties.huisletter = result.rows[index].huisletter;
                        delete result.rows[index].huisletter;
                        result.rows[index].properties.huisnummertoevoeging = result.rows[index].huisnummertoevoeging;
                        delete result.rows[index].huisnummertoevoeging;
                        result.rows[index].properties.postcode = result.rows[index].postcode;
                        delete result.rows[index].postcode;
                        result.rows[index].properties.woonplaatsnaam = result.rows[index].woonplaatsnaam;
                        delete result.rows[index].woonplaatsnaam;
                        result.rows[index].properties.gemeentenaam = result.rows[index].gemeentenaam;
                        delete result.rows[index].gemeentenaam;
                        result.rows[index].properties.provincienaam = result.rows[index].provincienaam;
                        delete result.rows[index].provincienaam;
                        result.rows[index].properties.typeadresseerbaarobject = result.rows[index].typeadresseerbaarobject;
                        delete result.rows[index].typeadresseerbaarobject;
                        result.rows[index].properties.adresseerbaarobject = result.rows[index].adresseerbaarobject;
                        delete result.rows[index].adresseerbaarobject;
                        result.rows[index].properties.nevenadres = result.rows[index].nevenadres;
                        delete result.rows[index].nevenadres;                                                
                    }
                    res.json({"type": "FeatureCollection","features": result.rows});
                }
                return;
            }
        );
    }
};

exports.getPanden = function(req, res) {
    //console.log(req);
    //where adresseerbaarobject = 796010000436352
    if (req.query) {
        id = req.params.id;
        srid = req.query.srid;
        if(!srid){
            srid = 4326;
        }
        var query_str = 'select st_astext(a.geopunt) geopunt, vp.gerelateerdpand as pand from bag8jan2014.adres a left join bag8jan2014.verblijfsobjectpand vp on a.adresseerbaarobject = vp.identificatie where adresseerbaarobject = $1 limit 1';
        global.bag.query(query_str, [id],
            function(err, result){
                if(err) {
                    res.json(err);
                } else {
                    var geopunt = result.rows[0].geopunt;
                    var pandid = result.rows[0].pand;
                    var query_str = 'select p.identificatie, p.pandstatus, p.bouwjaar, st_asgeojson(st_force_2d(st_transform(p.geovlak,$2))) geovlak from bag8jan2014.pandactueelbestaand p where (ST_Overlaps(' + 
                            'ST_BUFFER(st_setSRID(ST_GeomFromText($1),28992), 100), p.geovlak) OR ST_Within(p.geovlak, ST_BUFFER(st_setSRID(ST_GeomFromText($1),28992), 100)))';
                    
                    global.bag.query(query_str,[geopunt,srid], function(err,result){
                        if(err){
                            res.json(err);
                        } else {
                            for (index = 0; index < result.rows.length; ++index) {
                                var geometry = JSON.parse(result.rows[index].geovlak);
                                delete result.rows[index].geovlak;
                                result.rows[index].geometry = geometry;
                                result.rows[index].type = "Feature";
                                result.rows[index].properties = {};
                                result.rows[index].properties.gid = result.rows[index].identificatie;
                                if(result.rows[index].identificatie === pandid){
                                    result.rows[index].properties.selected = true;
                                }
                                result.rows[index].properties.identificatie = result.rows[index].identificatie;
                                delete result.rows[index].identificatie;
                                result.rows[index].properties.pandstatus = result.rows[index].pandstatus;
                                delete result.rows[index].pandstatus;
                                result.rows[index].properties.bouwjaar = result.rows[index].bouwjaar;
                                delete result.rows[index].bouwjaar;
                            }
                            res.json({"type": "FeatureCollection","features": result.rows});
                        }
                        return;
                    });
                    
                    
                }
                return;
            });
    }
};

exports.autoComplete = function(req, res) {
    //console.log(req);
    //where adresseerbaarobject = 796010000436352
    if (req.query) {
        searchphrase = req.params.searchphrase;
        if(searchphrase.length > 2){
            srid = req.query.srid;
            if (!srid) {
                srid = 4326;
            }

            // Are there any spaces in the searchphrase? use to_tsquery!
            var query_str = "select openbareruimtenaam || ' ' || " +
                    "CASE WHEN lower(woonplaatsnaam) = lower(gemeentenaam) THEN woonplaatsnaam " +
                    "ELSE woonplaatsnaam || ', ' || gemeentenaam END as display_name, " +
                    "st_x(st_transform(st_centroid(st_collect(geopunt)),$2)) as lon, " +
                    "st_y(st_transform(st_centroid(st_collect(geopunt)),$2)) as lat " +
                    "from bag8jan2014.adres where " +
                    "openbareruimtenaam like $1 " + 
                    "group by woonplaatsnaam, gemeentenaam, openbareruimtenaam limit 10";
            //( textsearchable_adres @@ to_tsquery('dutch','spinellihof $1 limit 1';
            console.log(query_str);
            global.bag.query(query_str, [searchphrase.toProperCase() + '%', srid],
                function(err, result) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(result.rows);
                    }
                return;
            });
        } else {
            return res.json([]);
        }
    }
};