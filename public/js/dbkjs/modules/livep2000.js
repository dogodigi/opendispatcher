/*!
 *  Copyright (c) 2014 B3Partners (info@b3partners.nl)
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

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.livep2000 = {
    id: "dbk.module.livep2000",
    popup: null,
    dataXml: null,
    gms: null,
    updated: null,
    viewed: false,
    markers: null,
    gmsMarker: null,
    zoomedPos: null,
    encode: function(s) {
        if(s) {
            return dbkjs.util.htmlEncode(s);
        }
        return null;
    },
    encodeIfNotEmpty: function(s) {
        return s === null ? "" : this.encode(s);
    },
    register: function(options) {
        var me = this;

        this.createPopup();

        $('<a></a>')
            .attr({
                'id': 'btn_openlivep2000',
                'class': 'btn btn-default navbar-btn',
                'href': '#',
                'title': 'P2000'
            })
            .append('<i class="fa fa-fire"></i>')
            .click(function(e) {
                e.preventDefault();
                me.popup.show();
            })
            .appendTo('#btngrp_3');

        this.markers = new OpenLayers.Layer.Markers("P2000 Marker");
        dbkjs.map.addLayer(this.markers);

        this.loadP2000();
    },
    createPopup: function() {
        this.popup = dbkjs.util.createModalPopup({
            title: 'P2000'
        });
        this.popup.getView().append($('<h4 id="p2000Update" style="padding-bottom: 15px">Gegegevens ophalen...</h4><div id="p2000"></div>'));
    },
    loadP2000: function() {
        var me = this;
        me.error = false;
        var url = "http://feeds.livep2000.nl/?d=1";
        if(dbkjs.options.liveP2000Region !== null) {
            url += "&r=" + dbkjs.options.liveP2000Region;
        }
        $.ajax(dbkjs.basePath + 'proxy/', {
            dataType: "xml",
            data: {q: url},
            cache: false,
            ifModified: true,
            complete: function(jqXHR, textStatus) {
                try {
                    if(textStatus === "success") {
                        var lastModified = moment(jqXHR.getResponseHeader("Last-Modified"));
                        me.updated = lastModified.isValid() ? lastModified : moment();

                        me.dataXml = jqXHR.responseXML;

                        me.updateWindow();
                    } else if(textStatus !== "notmodified") {
                        me.error = "Fout bij het ophalen van de informatie: " + jqXHR.statusText;
                    };
                } catch(e) {
                    if(console && console.log) {
                        console.log("JS exception bij verwerken GMS info", e);
                    }
                };

                window.setTimeout(function() {
                    me.loadP2000();
                }, 60000);
            }
        });
    },
    updateWindow: function() {
        var me = this;

        $("#p2000").empty();

        if(this.error) {
            $("#p2000Update").text(this.error);
            return;
        }

        var buildDate = moment($(this.dataXml).find('lastBuildDate').text());

        var header = $("<span>Gegevens van <a href=\"http://www.livep2000.nl\" target=\"_blank\">www.livep2000.nl</a> (laatst gewijzigd " + buildDate.fromNow() + "):</span>");
        $("#p2000Update").empty().append(header);

        $(this.dataXml).find('item').each(function() {

            var div = $("<div class=\"melding\"></div>");

            var lat = $(this).find('lat').text();
            var long = $(this).find('long').text();

            var titel = $(lat && long ? "<a/>" : "<div/>");
            titel.attr({class: "titel"});
            titel.append(me.encode($(this).find('title').text()));

            if(lat && long) {
                titel.on("click", function() {
                    var p = new Proj4js.Point(long, lat);
                    var t = Proj4js.transform(new Proj4js.Proj("WGS84"), new Proj4js.Proj("EPSG:28992"), p);
                    lon = t.x;
                    lat = t.y;
                    var reprojected = new OpenLayers.LonLat(lon, lat);
                    dbkjs.map.setCenter(reprojected, dbkjs.options.zoom);
                    me.popup.hide();
                });
            }
            div.append(titel);
            var pubDate = moment($(this).find('pubDate').text());
            div.append($("<div class=\"tijd\">" + pubDate.format("dddd, D-M-YYYY HH:mm:ss") + " (" + pubDate.fromNow() + ")</div>"));

            div.appendTo("#p2000");
        });

    }
};
