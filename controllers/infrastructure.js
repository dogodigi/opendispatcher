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

/* global exports, global */

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

exports.getVersion = function (req, res) {
    if (global.infra) {
        var query_str = 'select updated from current.update_info where dataset=$1';
        global.infra.query(query_str, ['nwb'],
                function (err, result) {
                    if (err) {
                        res.status(400).json(err);
                    } else {
                        for (index = 0; index < result.rows.length; ++index) {
                        }
                        res.json(result.rows);
                    }
                    return;
                }
        );
    }else {
        res.status(400).json({"err": -1, "message": "infrastructure is not implemented"});
    }
};

exports.autoComplete = function (req, res) {
    // @todo Check to see if the database is up. If not, fall back to nominatim!
    if (global.infra) {
        if (req.query) {
            console.log('infrastructure.autocomplete');
            searchtype = req.params.searchtype.toLowerCase();
            if (searchtype !== 'autoweg' &&
                    searchtype !== 'spoorweg' &&
                    searchtype !== 'vaarweg') {
                searchtype = 'autoweg';
            }
            searchphrase = req.params.searchphrase;
            if (searchphrase.length > 1) {
                srid = req.query.srid;
                if (!srid) {
                    srid = 4326;
                }

                whereclause = "(search_val @@ to_tsquery('dutch',$1)) ";
                finalsearch = searchphrase.trim().toProperCase().replace(/ /g, "&");

                var query_str = "select source, val as display_name, " +
                        "st_x(st_transform(st_centroid(st_collect(the_geom)),$2)) as lon, " +
                        "st_y(st_transform(st_centroid(st_collect(the_geom)),$2)) as lat " +
                        "from current.search_infra where " +
                        whereclause + ' and source=$3 ' +
                        "group by source, val limit 10";
                global.infra.query(query_str, [finalsearch, srid, searchtype],
                        function (err, result) {
                            if (err) {
                                res.status(400).json(err);
                            } else {
                                res.json(result.rows);
                            }
                            return;
                        });
            } else {
                return res.json([]);
            }
        }
    } else {
        res.status(400).json({"err": -1, "message": "infrastructure is not implemented"});
    }
};