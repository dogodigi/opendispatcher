/*!
 *  Copyright (c) 2014 Matthijs Laan (matthijslaan@b3partners.nl)
 *
 *  This file is part of opendispatcher/safetymapDBK
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

/* global OpenLayers, Proj4js */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.ealgps = {
    id: "dbk.module.ealgps",
    gps: null,
    markers: null,
    gpsMarker: null,
    debug: null,
    register: function (options) {
        this.debug = !!dbkjs.options.ealgpsDebug;

        var _obj = dbkjs.modules.ealgps;
        $('<a></a>')
            .attr({
                'id': 'btn_ealgps',
                'class': 'btn btn-default navbar-btn nofix',
                'href': '#',
                'title': 'GPS',
                'style': 'color: gray'
            })
            .append('<i class="fa fa-location-arrow"></i>')
            .click(function(e) {
                e.preventDefault();
                _obj.click(e);
            })
            .appendTo('#btngrp_3');

        this.markers = new OpenLayers.Layer.Markers("GPS Marker");
        dbkjs.map.addLayer(this.markers);

        this.loadGps();
    },
    loadGps: function () {
        var me = this;
        me.error = false;
        $.ajax("../eal/Gps.json", {
            dataType: "json",
            cache: false,
            ifModified: true,
            complete: function (jqXHR, textStatus) {
                var monitor = dbkjs.modules.connectionmonitor;
                if (monitor) {
                    monitor.cancelConnectivityCheck();
                }
                if (textStatus === "success") {
                    if (monitor) {
                        monitor.onConnectionOK();
                    }
                    var oldSequence = me.gps ? me.gps.Sequence : null;
                    var oldLatLon = me.gps && me.gps.Gps ? me.gps.Gps.Latitude + "," + me.gps.Gps.Longitude : null;
                    me.gps = jqXHR.responseJSON.EAL2OGG;
                    if (me.gps.Sequence !== oldSequence) {
                        if (me.debug) console.log("New GPS data sequence = " + me.gps.Sequence);
                        if (me.gps.Gps.Validity !== "0") {
                            if (me.debug) console.log("No valid GPS fix");
                            if(me.gpsMarker) {
                                me.markers.removeMarker(me.gpsMarker);
                            }
                            $("#btn_ealgps").attr('style', 'color: gray');
                        } else {
                            if (oldLatLon === null || me.gps.Gps.Latitude + "," + me.gps.Gps.Longitude !== oldLatLon) {
                                if (me.debug) console.log("New or updated position at lon/lon " + me.gps.Gps.Longitude + "," + me.gps.Gps.Latitude);
                                if (me.gpsMarker) {
                                    me.markers.removeMarker(me.gpsMarker);
                                }
                                $("#btn_ealgps").attr('style', '');

                                me.addMarker();
                            }
                        }
                    }
                } else if (textStatus === "notmodified") {
                    if (monitor) {
                        monitor.onConnectionOK();
                    }
                } else {
                    if (me.debug) console.log("Fout bij het ophalen van EAL GPS info: " + jqXHR.statusText);
                    me.gps = null;
                    if (monitor) {
                        monitor.onConnectionError();
                    }
                }

                window.setTimeout(function () {
                    me.loadGps();
                }, 5000);
            }
        });
    },
    reprojectToOpenLayersLonLat: function () {
        var me = this;
        var lon = me.gps.Gps.Longitude, lat = me.gps.Gps.Latitude;

        // Converteer van radialen naar graden
        lon = (lon / (3.14159265359 / 180)) / 100000000;
        lat = (lat / (3.14159265359 / 180)) / 100000000;

        if (dbkjs.options.ealgpsProjection && dbkjs.options.ealgpsProjection !== dbkjs.options.projection.code) {
            if (me.debug) console.log("Reprojecting eal GPS lon/lat from " + lon + "," + lat + " (" + dbkjs.options.ealgpsProjection + ") to " + dbkjs.options.projection.code);
            var p = new Proj4js.Point(lon, lat);
            var t = Proj4js.transform(new Proj4js.Proj(dbkjs.options.ealgpsProjection), new Proj4js.Proj(dbkjs.options.projection.code), p);
            if (me.debug) console.log("Reprojected coordinates: " + t.x + "," + t.y);
            lon = t.x;
            lat = t.y;
        }
        return new OpenLayers.LonLat(lon, lat);
    },
    addMarker: function () {
        var me = this;


        var size = new OpenLayers.Size(36,36);
        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
        me.gpsMarker = new OpenLayers.Marker(
                me.reprojectToOpenLayersLonLat(),
                new OpenLayers.Icon("images/marker-gps.png", size, offset));
        me.markers.addMarker(me.gpsMarker);

    },
    click: function (e) {
        var me = this;
        if (me.gps && me.gps.Gps.Validity === "0" && me.gps.Gps.Latitude && me.gps.Gps.Longitude) {
            dbkjs.map.setCenter(me.reprojectToOpenLayersLonLat(), dbkjs.options.zoom);
        }
    }
};
