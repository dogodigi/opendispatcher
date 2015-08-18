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

        this.createStyle();
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
    createStyle: function() {
        var css = '#eenheden div { margin: 3px; float: left } \n\
#eenheden { padding-bottom: 10px } \n\
#eenheden span.einde { color: gray } \n\
#kladblok { clear: both; padding-top: 10px; }',
            head = document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if(style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
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
                where: "IND_DISC_INCIDENT LIKE '_B_' AND (PRIORITEIT_INCIDENT_BRANDWEER IS NULL OR PRIORITEIT_INCIDENT_BRANDWEER <= 3) AND DTG_START_INCIDENT > TO_DATE('" + new moment().subtract(24, 'hours').format("YYYY-MM-DD HH:mm:ss") + "','YYYY-MM-DD HH24:MI:SS')",
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

        $.each(['DTG_START_INCIDENT','T_GUI_LOCATIE', 'POSTCODE', ,
                'PLAATS_NAAM', 'PRIORITEIT_INCIDENT_BRANDWEER'], function(i, prop) {
            var p = a[prop];
            if (!dbkjs.util.isJsonNull(p)) {
                var v;
                if(prop === "DTG_START_INCIDENT") {
                    var d = me.getAGSMoment(p);
                    v = d.format("dddd, D-M-YYYY HH:mm:ss") + " (" + d.fromNow() + ")";
                } else {
                    v = me.encode(p);
                }
                if(prop === "PRIORITEIT_INCIDENT_BRANDWEER") {
                    html += '<tr><td>&nbsp;</td><td></td></tr>';
                }
                html += '<tr><td><span>' + prop + "</span>: </td><td>" + v + "</td></tr>";
            }
        });

        html += '</table>';
        html += '<div id="mldClass" style="padding-bottom: 10px"></div>';
        html += '<div id="incidentClass" style="padding-bottom: 10px"></div>';
        html += '<div id="karakteristiek" style="padding-bottom: 10px"></div>';
        html += '<div id="eenheden"><h4>Eenheden:</h4><div id="brw"><b>Brandweer</b><br/></div><div id="pol"><b>Politie</b><br/></div><div id="ambu"><b>Ambu</b><br/></div></div>';
        html += '<div id="kladblok"/></div>';

        $('#incidentContent').html(html);

        $.ajax({
            url: me.layerUrls.klablok + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "INCIDENT_ID = " + a.INCIDENT_ID + " AND TYPE_KLADBLOK_REGEL = 'KB' AND T_IND_DISC_KLADBLOK_REGEL LIKE '_B_'",
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
                pre += me.getAGSMoment(k.DTG_KLADBLOK_REGEL).format("DD-MM-YYYY HH:mm:ss ") + me.encode(k.INHOUD_KLADBLOK_REGEL) + "\n";
            });
            $("#kladblok").append("<pre>" + pre + "</pre>");
        });

        $.ajax({
            url: me.layerUrls.inzetEenheid + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "INCIDENT_ID = " + a.INCIDENT_ID,
                orderByFields: "DTG_OPDRACHT_INZET",
                outFields: "*"
            },
            cache: false
        })
        .done(function(data, textStatus, jqXHR) {
            if(data.features.length === 0) {
                return;
            }

            var first = true;
            $.each(data.features, function(i, feature) {
                var a = feature.attributes;
                var eenheid = (a.CODE_VOERTUIGSOORT ? a.CODE_VOERTUIGSOORT : "") + " " + a.ROEPNAAM_EENHEID;
                if(a.KAZ_NAAM) {
                    eenheid += " (" + a.KAZ_NAAM + ")";
                }
                var container;
                if(a.T_IND_DISC_EENHEID === "B") {
                    container = "#brw";
                } else if(a.T_IND_DISC_EENHEID === "P") {
                    container = "#pol";
                } else if(a.T_IND_DISC_EENHEID === "A") {
                    container = "#ambu";
                }
                var span = a.DTG_EIND_ACTIE ? "<span class='einde'>" : "<span>";
                $(container).append(span + me.encode(eenheid) + "</span><br/>");
            });
        });

        $.ajax({
            url: me.layerUrls.mldClass + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "MELDING_CL_ID = " + a.BRW_MELDING_CL_ID,
                outFields: "WAARDE_MELD_CLASS"
            },
            cache: false
        })
        .done(function(data, textStatus, jqXHR) {
            var html = "<h4>GMS_MLD_CLASS: ";

            if(data.features.length === 0) {
                html += "-";
            } else {
                var first = true;
                $.each(data.features, function(i, feature) {
                    var a = feature.attributes;
                    if(!a.WAARDE_MELD_CLASS) {
                        return;
                    }
                    if(!first) {
                        html += ", ";
                    } else {
                        first = false;
                    }
                    html += me.encode(a.WAARDE_MELD_CLASS);
                });
            }

            var d = $("<div/>");
            d.html(html + "</h4>");
            d.appendTo('#mldClass');
        });

        $.ajax({
            url: me.layerUrls.incidentClass + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "INCIDENT_ID = " + a.INCIDENT_ID,
                outFields: "BRW_MELDING_CL1,BRW_MELDING_CL2"
            },
            cache: false
        })
        .done(function(data, textStatus, jqXHR) {
            var html = "<h4>GMSARC_INCIDENT: ";

            if(data.features.length === 0) {
                html += "-";
            } else {
                var a = data.features[0].attributes;
                html += me.encodeIfNotEmpty(a.BRW_MELDING_CL1);
                if(a.BRW_MELDING_CL2) {
                    if(a.BRW_MELDING_CL1) {
                        html += ", ";
                    }
                    html += me.encode(a.BRW_MELDING_CL2);
                };
                if(!a.BRW_MELDING_CL1 && !a.BRW_MELDING_CL1) {
                    html += "-";
                }
            }

            var d = $("<div/>");
            d.html(html + "</h4>");
            d.appendTo('#incidentClass');
        });

        $.ajax({
            url: me.layerUrls.karakteristiek + "/query",
            dataType: "json",
            data: {
                f: "pjson",
                where: "INCIDENT_ID = " + a.INCIDENT_ID,
                outFields: "NAAM_KARAKTERISTIEK,ACTUELE_KAR_WAARDE"
            },
            cache: false
        })
        .done(function(data, textStatus, jqXHR) {
            var html = "<h4>Karakteristieken:";

            if(data.features.length === 0) {
                html += " -</h4>";
            } else {
                html += '</h4><div style:"width: 100%" class="table-responsive">';
                html += '<table class="table table-hover">';
                $.each(data.features, function(i, feature) {
                    var a = feature.attributes;
                    if(!a.ACTUELE_KAR_WAARDE) {
                        return;
                    }
                    html += "<tr><td>" +me.encode(a.NAAM_KARAKTERISTIEK) + "</td><td>" + me.encode(a.ACTUELE_KAR_WAARDE) + "</td></tr>";
                });
            }

            var d = $("<div/>");
            d.html(html + "</table>");
            d.appendTo('#karakteristiek');
        });

        // TODO: set timeout om data te updaten, stop bij closen window

        this.incidentPopup.show();
    }
};
