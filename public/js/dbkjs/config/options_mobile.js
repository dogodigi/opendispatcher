/*!
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

/* global OpenLayers */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;

OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
OpenLayers.Lang.nl = OpenLayers.Util.applyDefaults({'Scale = 1 : ${scaleDenom}': "Schaal 1 : ${scaleDenom}"});
OpenLayers.Lang.setCode("nl");
Proj4js.defs["EPSG:28992"] = "+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.999908 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs <>";

var dbkjsLang = 'nl';

dbkjs.viewmode = 'fullscreen';

dbkjs.options = {
    projection: {
        code: "EPSG:28992",
        srid: 28992,
        coordinates: {
            numDigits: 0
        }
    },
    VERSION: "2.7",
    RELEASEDATE: "01-09-2014",
    APPLICATION: "safetymapsDBK",
    REMARKS: "",
    INFO: "",
    zoom: 13,

    // If false labels are shown on select and temporary render intents
    alwaysShowInformationLabels: false,

    // Set to true to enable style scaling according to map scale
    styleScaleAdjust: true,
    // Scale at which scaled values are returned as original
    originalScale: 595.2744,
    // User style value adjustment (before scaling)
    styleSizeAdjust: 0,

    alwaysShowDbkFeature: true,

    /**
     * PDOK settings, particular for the Netherlands national geodata services
     *
     * If the Dutch projection is in effect, set the resolutions and the max extent
     * See (www.geonovum.nl/index.php/tiling) [Dutch]
     **/
    pdok: {
        tms: {
            baseURL: 'http://geodata.nationaalgeoregister.nl',
            TMS: 'http://geodata.nationaalgeoregister.nl/tms/',
            WMTS: 'http://geodata.nationaalgeoregister.nl/tiles/service/wmts',
            tileOrigin: new OpenLayers.LonLat(-285401.920, 22598.080),
            matrixSet: 'EPSG:28992',
            tileFullExtent: new OpenLayers.Bounds(-285401.920, 22598.080, 595401.920, 903401.920),
            serverResolutions: [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420, 0.210, 0.105, 0.0525],
            matrixIds: new Array(15),
            zoomOffset: 2
        }
    },
    map: {
        options : {
        theme: null,
        controls: [new OpenLayers.Control.Navigation()],
        div: 'mapc1map1',
        projection: new OpenLayers.Projection("EPSG:28992"),
        resolutions: [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.210, 0.105, 0.0525, 0.02625, 0.013125, 0.0065625],
        xy_precision: 3,
        maxExtent: new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 68320096),
        units: "m"
        }
    }
};

dbkjs.options.pdok.matrixIds = [];
if (dbkjs.options.projection.code === 'EPSG:28992') {
    for (var i = 0; i < 15; ++i) {
        dbkjs.options.pdok.matrixIds[i] = dbkjs.options.projection.code + ':' + i;
    }
    dbkjs.options.pdok.resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.210, 0.105, 0.0525, 0.02625, 0.013125, 0.0065625];
    dbkjs.options.pdok.maxExtent = new OpenLayers.Bounds(-65200.96, 242799.04, 375200.96, 68320096);
    dbkjs.options.pdok.units = "m";
}
dbkjs.options.baselayers = [
    new OpenLayers.Layer.TMS(
            "Openbasiskaart",
            "tms",
            {
                layername: '', type: "png", serviceVersion: "",
                gutter: 0, buffer: 0, isBaseLayer: true, transitionEffect: 'resize',
                tileOrigin: new OpenLayers.LonLat(-285401.92, 22598.08),
                resolutions: dbkjs.options.pdok.resolutions,
                zoomOffset: 0,
                units: "m",
                maxExtent: new OpenLayers.Bounds(-285401.92, 22598.08, 595401.92, 903401.92),
                projection: new OpenLayers.Projection("EPSG:28992"),
                sphericalMercator: false,
                attribution: "OpenStreetMap"
            }
    ),
    new OpenLayers.Layer.TMS(
            'Basisregistratie Topografie (PDOK)',
            dbkjs.options.pdok.tms.TMS,
            {
                layername: 'brtachtergrondkaart',
                isBaseLayer: true,
                displayInLayerSwitcher: true,
                type: 'png',
                matrixSet: dbkjs.options.pdok.matrixSet,
                matrixIds: dbkjs.options.pdok.matrixIds,
                tileOrigin: dbkjs.options.pdok.tms.tileOrigin,
                serverResolutions: dbkjs.options.pdok.tms.serverResolutions,
                tileFullExtent: dbkjs.options.pdok.tms.tileFullExtent,
                attribution: "PDOK"
            }
    ),
    new OpenLayers.Layer.TMS(
            'Topografische kaart 1:10.000 - top10nl (PDOK)',
            dbkjs.options.pdok.tms.TMS,
            {
                layername: 'top10nl',
                isBaseLayer: true,
                displayInLayerSwitcher: true,
                type: 'png',
                matrixSet: dbkjs.options.pdok.matrixSet,
                matrixIds: dbkjs.options.pdok.matrixIds,
                tileOrigin: dbkjs.options.pdok.tms.tileOrigin,
                serverResolutions: dbkjs.options.pdok.tms.serverResolutions,
                tileFullExtent: dbkjs.options.pdok.tms.tileFullExtent,
                attribution: "PDOK"
            }
    )
];
