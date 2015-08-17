/*
 *  Copyright (c) 2015 B3Partners (info@b3partners.nl)
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
dbkjs.modules.vrhincidenten = {
    id: "dbk.module.vrhincidenten",
    layerUrls: null,
    popup: null,
    incidentPopup: null,
    updating: null,
    lastUpdated: null,
    markerLayer: null,
    marker: null,
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

        this.createPopups();

        $('<a></a>')
            .attr({
                'id': 'btn_openvrhincidenten',
                'class': 'btn btn-default navbar-btn',
                'href': '#',
                'title': 'Incidenten'
            })
            .append('<i class="fa fa-fire"></i>')
            .click(function(e) {
                e.preventDefault();

                me.popup.show();
            })
            .appendTo('#btngrp_3');

        this.markerLayer = new OpenLayers.Layer.Markers("Incidenten Marker", {
             rendererOptions: { zIndexing: true }
        });
        dbkjs.map.addLayer(this.markerLayer);

        this.initVrhService();
    },
    createPopups: function() {
        this.popup = dbkjs.util.createModalPopup({
            title: 'Incidenten'
        });
        this.popup.getView().append($('<h4 id="incidentenUpdate" style="padding-bottom: 15px">Gegegevens ophalen...</h4><div id="incidenten"></div>'));

        this.incidentPopup = dbkjs.util.createModalPopup({
            title: 'Incident'
        });
        this.incidentPopup.getView().append($('<h4 id="incidentHead" style="padding-bottom: 15px"></h4><div id="incidentContent"></div>'));
    },
    initVrhService: function() {
        var me = this;
        if(!dbkjs.options.vrhIncidentenUrl) {
            console.log("Missing dbkjs.options.vrhIncidentenUrl setting");
            return;
        }
        this.layerUrls = {};
        $.ajax({
            url: dbkjs.options.vrhIncidentenUrl,
            dataType: "json",
            data: {
                f: "pjson"
            },
            cache: false
        })
        .done(function(data) {
            $.each(data.tables, function(i,table) {
                if(/GMS_INCIDENT$/.test(table.name)) {
                    me.layerUrls.incident = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                } else if(/GMS_INZET_EENHEID$/.test(table.name)) {
                    me.layerUrls.inzetEenheid = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                } else if(/GMS_KLADBLOK$/.test(table.name)) {
                    me.layerUrls.klablok = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                } else if(/GMS_STATUS$/.test(table.name)) {
                    me.layerUrls.status = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                } else if(/GMS_EENHEID$/.test(table.name)) {
                    me.layerUrls.eenheid = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                } else if(/GMS_MLD_CLASS$/.test(table.name)) {
                    me.layerUrls.mldClass = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                } else if(/GMSARC_INCIDENT$/.test(table.name)) {
                    me.layerUrls.incidentClass = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                } else if(/GMSARC_KARAKTERISTIEK$/.test(table.name)) {
                    me.layerUrls.karakteristiek = dbkjs.options.vrhIncidentenUrl + "/" + table.id;
                }
            });

            if(!me.layerUrls.incident) {
                console.log("Fout: incidenten tabel niet gevonden in ArcGIS service " + dbkjs.options.vrhIncidentenUrl);
            } else {
                me.loadVrhIncidenten();
            }
        });
    },
    loadVrhIncidenten: function() {
        var me = this;
        me.updating = true;
        $("#incidentenUpdate").empty().append($("<span>Ophalen incidenten...</span>"));
        $.ajax({
            url: me.layerUrls.incident + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "IND_DISC_INCIDENT LIKE '_B_' AND DTG_START_INCIDENT > TO_DATE('" + new moment().subtract(24, 'hours').format("YYYY-MM-DD HH:mm:ss") + "','YYYY-MM-DD HH24:MI:SS')",
                orderByFields: "DTG_START_INCIDENT DESC",
                outFields: "*",
            },
            cache: false
        })
        .always(function() {
            me.updating = false;
            $("#incidenten").empty();

            window.setTimeout(function () {
                me.loadVrhIncidenten();
            }, 10000);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            $("#incidentenUpdate").text("Fout bij ophalen incidenten: " + jqXHR.statusText);
        })
        .done(function(data, textStatus, jqXHR) {
            if(!data.features) {
                return;
            }

            me.lastUpdated = new moment();

            var size = new OpenLayers.Size(20,25);
            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);

            var actief = 0;
            var anders = 0;

            var actiefDiv = $("<div/>");
            actiefDiv.appendTo("#incidenten");
            var andersDiv = $("<div style='padding-top: 10px'/>");
            andersDiv.append($("<span>Overige incidenten:</span>"));
            andersDiv.appendTo("#incidenten");

            me.markerLayer.clearMarkers();
            $.each(data.features, function(i, feature) {
                var isActief = feature.attributes.T_BRW_STATUS_INCIDENT === "I";

                if(isActief) {
                    actief++;
                } else {
                    anders++;
                }
                var pos = null;

                if(feature.attributes.T_X_COORD_LOC && feature.attributes.T_Y_COORD_LOC) {
                    pos = new OpenLayers.LonLat(feature.attributes.T_X_COORD_LOC, feature.attributes.T_Y_COORD_LOC);
                } else {
                    console.log("no location", feature);
                }

                // evt alleen actief

                if(pos !== null) {
                    var marker = new OpenLayers.Marker(
                        pos,
                        new OpenLayers.Icon(isActief ? "images/marker-red.png" : "images/marker-gray.png", size, offset)
                    );
                    marker.id = feature.attributes.INCIDENT_ID;
                    marker.events.register("click", marker, function() { me.markerClick(marker, feature); });
                    me.markerLayer.addMarker(marker);
                }

                var div = $("<div class=\"melding\"></div>");

                var titel = $(pos !== null ? "<a/>" : "<div/>");
                titel.attr({class: "titel"});
                titel.append(me.getIncidentTitle(feature));

                if(pos) {
                    titel.on("click", function() {
                        //dbkjs.map.setCenter(pos, dbkjs.options.zoom);
                        me.popup.hide();
                        me.incidentClick(feature);
                    });
                }
                div.append(titel);
                div.append(", " + me.getAGSMoment(feature.attributes.DTG_START_INCIDENT).fromNow());

                //var pubDate = moment($(this).find('pubDate').text());
                //div.append($("<div class=\"tijd\">" + pubDate.format("dddd, D-M-YYYY HH:mm:ss") + " (" + pubDate.fromNow() + ")</div>"));

                div.appendTo(isActief ? actiefDiv : andersDiv);
            });
            me.markerLayer.setZIndex(100000);

            $("#incidentenUpdate").empty().append($("<span>" + actief + " actieve incidenten, " + anders + " overige incidenten</span>"));

        });
    },
    getAGSMoment: function(epoch) {
        // Contrary to docs, AGS returns milliseconds since epoch in local time
        // instead of UTC
        return new moment(epoch).add(new Date().getTimezoneOffset(), 'minutes');
    },
    getIncidentTitle: function(feature) {
        var a = feature.attributes;
        return this.getAGSMoment(a.DTG_START_INCIDENT).format("D-M-YYYY HH:mm:ss") + " " + this.encode((a.PRIORITEIT_INCIDENT_BRANDWEER ? " PRIO " + a.PRIORITEIT_INCIDENT_BRANDWEER : "") + " " + a.T_GUI_LOCATIE);
    },
    markerClick: function(marker, feature) {
        this.incidentClick(feature);
    },
    incidentClick: function(feature) {
        var me = this;
        var a = feature.attributes;
        dbkjs.map.setCenter(new OpenLayers.LonLat(a.T_X_COORD_LOC, a.T_Y_COORD_LOC), dbkjs.options.zoom);

        $("#incidentHead").text(this.getIncidentTitle(feature));

        var html = '<div style:"width: 100%" class="table-responsive">';
        html += '<table class="table table-hover">';
        for (var j in a) {
            if ($.inArray(j, ['DTG_START_INCIDENT', 'POSTCODE', 'T_GUI_LOCATIE', 'T_X_COORD_LOC', 'T_Y_COORD_LOC',
                'PLAATS_ID', 'PRIORITEIT_INCIDENT_BRANDWEER']) > -1) {
                if (!dbkjs.util.isJsonNull(a[j])) {
                    var v;
                    if(j === "DTG_START_INCIDENT") {
                        var d = this.getAGSMoment(a[j]);
                        v = d.format("dddd, D-M-YYYY HH:mm:ss") + " (" + d.fromNow() + ")";
                    } else {
                        v = this.encode(a[j]);
                    }
                    html += '<tr><td><span>' + j + "</span>: </td><td>" + v + "</td></tr>";
                }
            }
        }
        html += '</table>';
        html += '<div id="eenheden" style="padding-bottom: 5px"/><div id="kladblok"/></div>';

        $('#incidentContent').html(html);

        $.ajax({
            url: me.layerUrls.klablok + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "INCIDENT_ID = " + a.INCIDENT_ID,
                orderByFields: "KLADBLOK_REGEL_ID,VOLG_NR_KLADBLOK_REGEL",
                outFields: "*"
            },
            cache: false
        })
        .done(function(data, textStatus, jqXHR) {
            if(!data.features) {
                return;
            }
            var pre = "";
            $.each(data.features, function(i, f) {
                var k = f.attributes;
                var r = "";
                if(k.VOLG_NR_KLADBLOK_REGEL !== 1) {
                    r = "                 ";
                }
                pre += r + me.encode(k.INHOUD_KLADBLOK_REGEL) + "\n";
            });
            $("#kladblok").append("<pre>" + pre + "</pre>");
        });

        $.ajax({
            url: me.layerUrls.inzetEenheid + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "INCIDENT_ID = " + a.INCIDENT_ID,
                outFields: "*"
            },
            cache: false
        })
        .done(function(data, textStatus, jqXHR) {
            var html = "<h4>Eenheden: ";

            if(data.features.length == 0) {
                html += "-";
            } else {
                var first = true;
                $.each(data.features, function(i, feature) {
                    var a = feature.attributes;
                    if(!first) {
                        html += ", ";
                    } else {
                        first = false;
                    }
                    html += a.CODE_VOERTUIGSOORT + " " + a.ROEPNAAM_EENHEID;
                    if(a.KAZ_NAAM) {
                        html += " (" + a.KAZ_NAAM + ")";
                    }
                });
            }

            var d = $("<div/>");
            d.html(html + "</h4>");
            d.appendTo('#eenheden');
        });

        this.incidentPopup.show();
    }
};
