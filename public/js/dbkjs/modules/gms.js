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
dbkjs.modules.gms = {
    id: "dbk.module.gms",
    gmsPopup: null,
    gms: null,
    updated: null,
    viewed: false,
    markers: null,
    gmsMarker: null,
    register: function(options) {
        var _obj = dbkjs.modules.gms;
        _obj.createPopup();
        $('<a></a>')
            .attr({
                'id': 'btn_opengms',
                'class': 'btn btn-default navbar-btn',
                'href': '#',
                'title': i18n.t('map.gms.button')
            })
            .append('<i class="fa fa-align-justify"></i>')
            .click(function(e) {
                e.preventDefault();
                _obj.gmsPopup.show();
                _obj.viewed = true;
                $("#btn_opengms").removeClass("unread");
            })
            .appendTo('#btngrp_3');

        this.markers = new OpenLayers.Layer.Markers("GMS Marker");
        dbkjs.map.addLayer(this.markers);

        this.checkFeaturesLoaded();
    },
    checkFeaturesLoaded: function() {
        var me = this;
        if(dbkjs.modules.feature.features.length === 0) {
            setTimeout(function() {
                me.checkFeaturesLoaded();
            }, 100);
        } else {
            this.loadGms();
        }
    },
    createPopup: function() {
        var _obj = dbkjs.modules.gms;
        _obj.gmsPopup = dbkjs.util.createModalPopup({
            title: 'Melding'
        });
        _obj.gmsPopup.getView().append($('<h4 id="gmsUpdate" style="padding-bottom: 15px">Gegegevens ophalen...</h4><div id="gms"></div>'));
    },
    loadGms: function() {
        var me = this;
        me.error = false;
        me.updateGmsTitle();
        $.ajax("../eal/Gms.json", {
            dataType: "json",
            cache: false,
            ifModified: true,
            complete: function(jqXHR, textStatus) {
                var monitor = dbkjs.modules.connectionmonitor;
                if(textStatus === "success") {
                    if(monitor) {
                        monitor.onConnectionOK();
                    };
                    var oldSequence = me.gms ? me.gms.Sequence : null;
                    var oldNummer = me.gms ? me.gms.Gms.Nummer : null;
                    me.gms = jqXHR.responseJSON.EAL2OGG;
                    if(me.gms.Sequence !== oldSequence) {
                        var lastModified = moment(jqXHR.getResponseHeader("Last-Modified"));
                        me.updated = lastModified.isValid() ? lastModified : moment();

                        // Alleen unread bij nieuw meldingsnummer
                        if(oldNummer === null || me.gms.Gms.Nummer !== oldNummer) {
                            me.viewed = false;
                        }

                        // Eventueel gewijzigde X en Y doorvoeren
                        if(me.gmsMarker) {
                            me.markers.removeMarker(me.gmsMarker);
                            me.gmsMarker = null;
                        }
                    }
                    me.displayGms();
                } else if(textStatus === "notmodified") {
                  if(monitor) {
                      monitor.onConnectionOK();
                  }
                } else {
                    me.error = "Fout bij het ophalen van de informatie: " + jqXHR.statusText;
                    me.gms = null;
                    if(monitor) {
                        monitor.onConnectionError();
                    }
                }
                me.updateGmsTitle();

                window.setTimeout(function() {
                    me.loadGms();
                }, 5000);
            }
        });
    },
    reprojectToOpenLayersLonLat: function() {
        var me = this;
        var lon = me.gms.Gms.IncidentAdres.Positie.X, lat = me.gms.Gms.IncidentAdres.Positie.Y;

        lon = lon / 100000;
        lat = lat / 100000;

        var p = new Proj4js.Point(lon, lat);
        var t = Proj4js.transform(new Proj4js.Proj("WGS84"), new Proj4js.Proj("EPSG:28992"), p);
        lon = t.x;
        lat = t.y;
        return new OpenLayers.LonLat(lon, lat);
    },
    updateGmsTitle: function() {
        var text;
        var melding = this.gms && this.gms.Gms && this.gms.Gms.Nummer;
        var updated = this.updated ? this.updated.fromNow() : "";
        if(melding) {
            if(this.updated) {
                text = "Actieve melding (laatste update " + updated + ")";
            } else {
                text = "Actieve melding (updaten...)";
            }
        } else {
            if(this.error) {
                text = this.error;
            } else {
                if(this.updated) {
                    text = "Geen actieve melding (laatste update " + updated + ")";
                } else {
                    text = "Geen actieve melding (updaten...)";
                }
            }
        }
        if(melding) {
            if(this.viewed) {
                $("#btn_opengms").removeClass("unread");
            } else {
                $("#btn_opengms").addClass("unread");
            }
            if(this.gmsMarker === null && this.gms.Gms.IncidentAdres && this.gms.Gms.IncidentAdres.Positie) {
                var p = this.reprojectToOpenLayersLonLat();
                var size = new OpenLayers.Size(21,25);
                var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
                this.gmsMarker = new OpenLayers.Marker(
                        p,
                        new OpenLayers.Icon("images/marker-red.png", size, offset));
                this.markers.addMarker(this.gmsMarker);

                this.selectDbk();

                this.zoom();
            }
        } else {
            $("#btn_opengms").removeClass("unread");
        }
        $("#gmsUpdate").text(text);
    },
    displayGms: function() {
        if(this.gms === null || !this.gms.Gms) {
            $("#gms").replaceWith('<div id="gms"></div>');
            return;
        }
        var g = this.gms.Gms;
        var table_div = $('<div id="gms" class="table-responsive"></div>');
        var table = $('<table class="table table-hover"></table>');
        table_div.append(table);

        function row(val, caption) {
            if(!dbkjs.util.isJsonNull(val)) {
                table.append('<tr><td>' + caption + '</td><td>' + val + '</td></tr>');
            }
        }

        function e(s) {
            if(s) {
                return dbkjs.util.htmlEncode(s);
            }
            return null;
        }
        function en(s) {
            var s = e(s);
            return s === null ? "" : s;
        }

        row(e(g.Nummer), "Nummer");
        var m = moment(g.Tijd);
        row(m.format("DD MMMM YYYY HH:mm:ss") + " (" + m.fromNow() + ")", "Tijd");
        row(e(g.Prioriteit), "Prioriteit");
        row(e(g.Classificatie ? g.Classificatie.replace(/,/g, ", ") : null), "Classificatie");
        row(e(g.Karakterestiek), "Karakteristiek"); // sic
        var a = g.IncidentAdres;
        if(a && a.Adres) {
            var s = en(a.Adres.Straat) + " " + en(a.Adres.Huisnummer) + en(a.Adres.HuisnummerToevg) + ", " +
                    en(a.Adres.Postcode) + " " + en(a.Adres.Plaats);
            row(s, "Adres");
        }
        row(e(a.Aanduiding), "Aanduiding");
        if(a.Positie) {
            var reprojected = this.reprojectToOpenLayersLonLat();
            c = e(reprojected.lon.toFixed() + ", " + reprojected.lat.toFixed());
            table.append('<tr><td>Coördinaten</a></td>' +
                    '<td><a href="#" onclick="dbkjs.modules.gms.zoom(); dbkjs.modules.gms.gmsPopup.hide();">' + c + '</a></td></tr>');
        } else {
        }
        if(g.Kladblok) {
            row(e(dbkjs.util.nl2br(g.Kladblok)), "Kladblok");
        }

        $("#gms").replaceWith(table_div);


    },
    selectDbk: function() {
        if(this.gms && this.gms.Gms && this.gms.Gms.IncidentAdres && this.gms.Gms.IncidentAdres.Adres) {
            var a = this.gms.Gms.IncidentAdres.Adres;

            var dbk = null;
            $.each(dbkjs.modules.feature.features, function(index, f) {
                var fas = f.attributes.adres;
                $.each(fas, function(index, fa) {
                    if(fa) {
                        var matchPostcode = a.Postcode && fa.postcode && a.Postcode === fa.postcode;
                        var matchWoonplaats = a.Plaats && fa.woonplaatsNaam && fa.woonplaatsNaam.toLowerCase().indexOf(a.Plaats.toLowerCase()) !== -1;
                        var matchStraat = a.Straat && fa.openbareRuimteNaam && fa.openbareRuimteNaam.toLowerCase().indexOf(a.Straat.toLowerCase()) !== -1;
                        var matchHuisnummer = a.Huisnummer && fa.huisnummer && Number(a.Huisnummer) === fa.huisnummer;

                        if(matchHuisnummer) {
                            if(matchPostcode || (matchWoonplaats && matchStraat)) {
                                dbk = f;
                                return false;
                            }
                        }
                    }
                });

                if(dbk) {
                    return false;
                }
            });

            if(dbk) {
                dbkjs.modules.feature.handleDbkOmsSearch(dbk);
            }
        }

    },
    zoom: function() {
        if(this.gms && this.gms.Gms && this.gms.Gms.IncidentAdres && this.gms.Gms.IncidentAdres.Positie) {
            var reprojected = this.reprojectToOpenLayersLonLat();
            dbkjs.map.setCenter(reprojected, dbkjs.options.zoom);
        }
    }
};
