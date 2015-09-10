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

/* global OpenLayers */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.options = {
    projection: {
        code: "EPSG:900913",
        srid: 900913,
        coordinates: {
            numDigits: 4
        }
    },
    zoom: 19,
    map: {
        options : {
            theme: null,
            controls: [new OpenLayers.Control.Navigation()],
            div: 'mapc1map1'
        }
    }
};

dbkjs.options.baselayers = [
    new OpenLayers.Layer.OSM("OpenStreetMap",
        null,{
            tileOptions: {crossOriginKeyword: null},
            resolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                          19567.87923828125, 9783.939619140625, 4891.9698095703125,
                          2445.9849047851562, 1222.9924523925781, 611.4962261962891,
                          305.74811309814453, 152.87405654907226, 76.43702827453613,
                          38.218514137268066, 19.109257068634033, 9.554628534317017,
                          4.777314267158508, 2.388657133579254, 1.194328566789627,
                          0.5971642833948135, 0.25, 0.1, 0.05],
            serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                                19567.87923828125, 9783.939619140625,
                                4891.9698095703125, 2445.9849047851562,
                                1222.9924523925781, 611.4962261962891,
                                305.74811309814453, 152.87405654907226,
                                76.43702827453613, 38.218514137268066,
                                19.109257068634033, 9.554628534317017,
                                4.777314267158508, 2.388657133579254,
                                1.194328566789627, 0.5971642833948135],
            transitionEffect: 'resize'
        }
    ),
    new OpenLayers.Layer.OSM(
        "MapQuest",
        [
            "http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"
        ],
        {
            tileOptions: {crossOriginKeyword: null},
            attribution: "Data, imagery and map information provided by <a href='http://www.mapquest.com/'  target='_blank'>MapQuest</a>, <a href='http://www.openstreetmap.org/' target='_blank'>Open Street Map</a> and contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/' target='_blank'>CC-BY-SA</a>  <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
            transitionEffect: "resize"
        }
    ),
    new OpenLayers.Layer.OSM(
        "Imagery",
        [
            "http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
            "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
            "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
            "http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png"
        ],
        {
            tileOptions: {crossOriginKeyword: null},
            attribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency. <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
            transitionEffect: "resize"
        }
    )
];
