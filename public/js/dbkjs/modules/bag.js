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
dbkjs.modules = dbkjs.modules || {};

/**
* @memberof dbkjs.modules
* @exports bag
*/
dbkjs.modules.bag = {
    id: "dbk.modules.bag",
    namespace: "bag",
    layer: null,
    panel_group: null,
    panel_tabs: null,
    panel_algemeen: null,
    div: null,
    activateVectors: function() {
        var _obj = dbkjs.modules.bag;
        _obj.pandprotocol = new OpenLayers.Protocol.WFS({
            url: "/bag/wfs",
            featurePrefix: 'bagviewer',
            featureType: "pand",
            featureNS: "http://bagviewer.geonovum.nl",
            geometryName: "geometrie",
            srsName: dbkjs.options.projection.code,
            outputFormat: 'json',
            handleRead: function(response) {
                var features = new OpenLayers.Format.GeoJSON().read(JSON.parse(response.priv.responseText));
                _obj.pand_layer.addFeatures(features);
                _obj.vbo_layer.filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "pandidentificatie",
                    value: 0
                });
                for (var feat in features) {
                    var e = {};
                    e.feature = features[feat];
                    _obj.getfeatureinfo(e);
                    var filter = new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "pandidentificatie",
                        value: features[feat].attributes.identificatie
                    });
                    _obj.verblijfsobjectprotocol.read({filter: filter});
                    return false;
                }
            }
        });
        _obj.verblijfsobjectprotocol = new OpenLayers.Protocol.WFS({
            url: "/bag/wfs",
            featurePrefix: 'bagviewer',
            featureType: "verblijfsobject",
            featureNS: "http://bagviewer.geonovum.nl",
            geometryName: "geometrie",
            srsName: "EPSG:28992",
            outputFormat: 'json',
            handleRead: function(response) {
                var features = new OpenLayers.Format.GeoJSON().read(JSON.parse(response.priv.responseText));
                _obj.vbo_layer.addFeatures(features);
                for (var feat in features) {
                    _obj.vboInfo(features[feat]);
                }
            }
        });

        _obj.pand_layer = new OpenLayers.Layer.Vector("BAG panden", {
            styleMap: dbkjs.config.styles.pandstylemap
        });

        _obj.vbo_layer = new OpenLayers.Layer.Vector("BAG verblijfsobjecten", {
            styleMap: dbkjs.config.styles.vbostylemap
        });
        dbkjs.map.addLayers([_obj.pand_layer, _obj.vbo_layer]);
    },
    /**
     * Initialisatie functie om objecten toe te voegen aan de kaart
     */
    register: function() {
        var _visibility = false;
        if (!$.browser.device){
            _visibility = true;

            var _obj = dbkjs.modules.bag;
            $('body').append(dbkjs.util.createDialog('bagpanel', '<i class="fa fa-home"></i> ' + i18n.t("dialogs.bag"), 'right:0;bottom:0;'));
            _obj.layer = new OpenLayers.Layer.WMS("BAG", "/bag/wms?",
                    {layers: 'pand,standplaats,ligplaats', format: 'image/png', transparent: true, maxScale: 5000},
            {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: _visibility});
            _obj.layer.dbkjsParent = _obj;
            dbkjs.map.addLayer(_obj.layer);
            _obj.layer.events.register("loadstart", _obj.layer, function() {
                dbkjs.util.loadingStart(_obj.layer);
            });

            _obj.layer.events.register("loadend", _obj.layer, function() {
                dbkjs.util.loadingEnd(_obj.layer);
            });
            dbkjs.map.setLayerIndex(_obj.layer, 0);

            // vinkje op webpagina aan/uitzetten
            var dv_panel = $('<div class="panel"></div>');
            var dv_panel_heading = $('<div class="panel-heading"></div>');
            var dv_panel_title = $('<h4 class="panel-title"></div>');
            dv_panel_title.append('<input type="checkbox" name="box_' + _obj.id + '"/>&nbsp;');
            dv_panel_title.append(
                    _obj.layer.name + '&nbsp;<a  class="accordion-toggle" data-toggle="collapse" href="#collapse_' +
                    _obj.id +
                    '" data-parent="#overlaypanel_b1" ><i class="fa fa-info-circle"></i></a>'
                    );
            dv_panel_heading.append(dv_panel_title);
            dv_panel.append(dv_panel_heading);
            var dv_panel_content = $('<div id="collapse_' + _obj.id + '" class="panel-collapse collapse"></div>');
            dv_panel_content.append('<div class="panel-body">' +
                    '<p>' + i18n.t('dialogs.bagdescription') + '</p>' +
                    '<p>' +
                    '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#cccccc;border:3px solid #000000;">&nbsp;</div></div><div class="col-xs-10"> ' + i18n.t('dialogs.bagbuildings') + '</div></div>' +
                    '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#D7DF01;border:2px solid #ff0000;">&nbsp;</div></div><div class="col-xs-10"> ' + i18n.t('dialogs.selectedbuildings') + '</div></div>' +
                    '<div class="row"><div class="col-xs-2 text-center"><i class="fa fa-circle" style="color:#610B21;"></i></div><div class="col-xs-10"> ' + i18n.t('dialogs.bagvbuildings') + '</div></div>' +
                    '</p></div>');
            dv_panel.append(dv_panel_content);
            $('#overlaypanel_b1').append(dv_panel);
            if (_obj.layer.getVisibility()) {
                //checkbox aan
                $('input[name="box_' + _obj.id + '"]').attr('checked', 'checked');
                _obj.activateVectors();
            }

            $('input[name="box_' + _obj.id + '"]').click(function() {
                if ($(this).is(':checked')) {
                    _obj.layer.setVisibility(true);
                    _obj.activateVectors();
                } else {
                    _obj.layer.setVisibility(false);
                    $('#bagpanel').hide();
                    var bagpand_lyr = dbkjs.map.getLayersByName('BAG panden')[0];
                    var bagvbo_lyr = dbkjs.map.getLayersByName('BAG verblijfsobjecten')[0];

                    if (bagpand_lyr) {
                        _obj.pand_layer.destroyFeatures();
                        dbkjs.map.removeLayer(bagpand_lyr);
                    }
                    if (bagvbo_lyr) {
                        _obj.vbo_layer.destroyFeatures();
                        dbkjs.map.removeLayer(bagvbo_lyr);
                    }

                }
            });
        }
    },
    vboInfo: function(feature) {
        var _obj = dbkjs.modules.bag;
        if (feature) {
            var vbo_div = $('<div class="tab-pane" id="collapse_vbo_' + feature.attributes.identificatie + '"></div>');
            var vbo_table_div = $('<div class="table-responsive"></div>');
            var vbo_table = $('<table class="table table-hover"></table>');
            var huisnummer = dbkjs.util.isJsonNull(feature.attributes.huisnummer) ? '' : feature.attributes.huisnummer;
            var huisletter = dbkjs.util.isJsonNull(feature.attributes.huisletter) ? '' : feature.attributes.huisletter;
            var toevoeging = dbkjs.util.isJsonNull(feature.attributes.toevoeging) ? '' : feature.attributes.toevoeging;

            vbo_table.append('<tr><td>Identificatie</td><td>' + feature.attributes.identificatie + "</td></tr>");
            vbo_table.append('<tr><td>Adres</td><td>' + dbkjs.util.createAddress(
                    '',
                    feature.attributes.woonplaats,
                    feature.attributes.openbare_ruimte,
                    huisnummer,
                    $.trim(huisletter + ' ' + toevoeging),
                    '',
                    feature.attributes.postcode
                    ).html() +
                    '</td></tr>');
            if (!dbkjs.util.isJsonNull(feature.attributes.bouwjaar)) {
                vbo_table.append('<tr><td>Bouwjaar</td><td>' + feature.attributes.bouwjaar + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.status)) {
                vbo_table.append('<tr><td>Status</td><td>' + feature.attributes.status + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.gebruiksdoel)) {
                vbo_table.append('<tr><td>Gebruiksdoel</td><td>' + feature.attributes.gebruiksdoel + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.oppervlakte)) {
                vbo_table.append('<tr><td>Oppervlakte</td><td>' + feature.attributes.oppervlakte + " m&sup2;</td></tr>");
            }
            vbo_table_div.append(vbo_table);
            vbo_div.append(vbo_table_div);
            _obj.panel_group.append(vbo_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_vbo_' +
                    feature.attributes.identificatie +
                    '">#' +
                    $.trim(huisnummer + ' ' + huisletter + ' ' + toevoeging) +
                '</a></li>');
        }
    },
    vboInfo2: function(feature) {
        var _obj = dbkjs.modules.bag;
        _obj.panel_group = $('<div class="tab-content"></div>');
        _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
        _obj.div = $('<div class="tabbable"></div>');
        _obj.div.append(_obj.panel_group);
        _obj.div.append(_obj.panel_tabs);
        $('#bagpanel_b').html(_obj.div);

        if (feature) {
            var vbo_div = $('<div class="tab-pane active" id="collapse_vbo_' + feature.attributes.identificatie + '"></div>');
            var vbo_table_div = $('<div class="table-responsive"></div>');
            var vbo_table = $('<table class="table table-hover"></table>');
            var huisnummer = dbkjs.util.isJsonNull(feature.attributes.huisnummer) ? '' : feature.attributes.huisnummer;
            var huisletter = dbkjs.util.isJsonNull(feature.attributes.huisletter) ? '' : feature.attributes.huisletter;
            var toevoeging = dbkjs.util.isJsonNull(feature.attributes.toevoeging) ? '' : feature.attributes.toevoeging;

            vbo_table.append('<tr><td>Identificatie</td><td>' + feature.attributes.identificatie + "</td></tr>");
            vbo_table.append('<tr><td>Adres</td><td>' + dbkjs.util.createAddress(
                    '',
                    feature.attributes.woonplaats,
                    feature.attributes.openbare_ruimte,
                    huisnummer,
                    $.trim(huisletter + ' ' + toevoeging),
                    '',
                    feature.attributes.postcode
                    ).html() +
                    '</td></tr>');
            if (!dbkjs.util.isJsonNull(feature.attributes.bouwjaar)) {
                vbo_table.append('<tr><td>Bouwjaar</td><td>' + feature.attributes.bouwjaar + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.status)) {
                vbo_table.append('<tr><td>Status</td><td>' + feature.attributes.status + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.gebruiksdoel)) {
                vbo_table.append('<tr><td>Gebruiksdoel</td><td>' + feature.attributes.gebruiksdoel + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.oppervlakte)) {
                vbo_table.append('<tr><td>Oppervlakte</td><td>' + feature.attributes.oppervlakte + " m&sup2;</td></tr>");
            }
            vbo_table_div.append(vbo_table);
            vbo_div.append(vbo_table_div);
            _obj.panel_group.append(vbo_div);
            _obj.panel_tabs.append('<li class="active"><a data-toggle="tab" href="#collapse_vbo_' +
                    feature.attributes.identificatie +
                    '">#' +
                    $.trim(huisnummer + ' ' + huisletter + ' ' + toevoeging) +
                '</a></li>');
        }
    },
    pandInfo: function(feature) {
        var _obj = dbkjs.modules.bag;
        if (feature.fid) {
            _obj.panel_group = $('<div class="tab-content"></div>');
            _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
            var div = $('<div class="tabbable"></div>');
            var ret_tab = $('<div class="tab-pane active" id="collapse_pand_' + feature.attributes.identificatie + '"></div>');
            var ret_table_div = $('<div class="table-responsive"></div>');
            var ret_table = $('<table class="table table-hover"></table>');
            if (!dbkjs.util.isJsonNull(feature.attributes.bouwjaar)) {
                ret_table.append('<tr><td>Bouwjaar</td><td>' + feature.attributes.bouwjaar + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.status)) {
                ret_table.append('<tr><td>Status</td><td>' + feature.attributes.status + "</td></tr>");
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.gebruiksdoel)) {
                ret_table.append('<tr><td>Gebruiksdoel</td><td>' + feature.attributes.gebruiksdoel + "</td></tr>");
            }
            var opp_min = 0;
            var opp_max = 0;
            if (!dbkjs.util.isJsonNull(feature.attributes.oppervlakte_min)) {
                opp_min = feature.attributes.oppervlakte_min;
            }
            if (!dbkjs.util.isJsonNull(feature.attributes.oppervlakte_max)) {
                opp_max = feature.attributes.oppervlakte_max;
            }
            ret_table.append('<tr><td>Oppervlakte min/max</td><td>' + opp_min + ' m&sup2; / ' + opp_max + " m&sup2;</td></tr>");
            ret_table_div.append(ret_table);
            ret_tab.append(ret_table_div);
            _obj.panel_group.append(ret_tab);
            //nu nog de nav pills
            _obj.panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_pand_' + feature.attributes.identificatie + '">Pand</a></li>');
            div.append(_obj.panel_group);
            div.append(_obj.panel_tabs);
            dbkjs.modules.bag.div = div;
            $('#bagpanel_b').html(div);
        }
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.bag;
        if (_obj.layer.getVisibility() && dbkjs.map.zoom > 10) {
            if (typeof(e.feature) !== "undefined") {
                dbkjs.util.changeDialogTitle('<i class="fa fa-home"></i> Pand ' + e.feature.attributes.identificatie, '#bagpanel');
                _obj.pandInfo(e.feature);
                $('#bagpanel_f').html('Fouten ontdekt in de BAG? <a href="https://www.kadaster.nl/web/formulier/BAG-formulieren/BAG-terugmelding.htm">Meld het!</a>');
                $('#bagpanel').show();

            } else {
                _obj.pand_layer.destroyFeatures();
                _obj.vbo_layer.destroyFeatures();
                var lonLat = dbkjs.map.getLonLatFromViewPortPx(new OpenLayers.Pixel(e.xy.x, e.xy.y));
                var filter = new OpenLayers.Filter.Spatial({
                    type: OpenLayers.Filter.Spatial.CONTAINS,
                    property: "geometrie",
                    value: new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat)
                });
                _obj.pandprotocol.read({filter: filter});
                return false;
            }
        } else {
            _obj.pand_layer.destroyFeatures();
            _obj.vbo_layer.destroyFeatures();
        }
    },
    getVBO: function(bagvboid, callback) {

        var verblijfsobjectprotocol = new OpenLayers.Protocol.WFS({
            url: "/bag/wfs",
            featurePrefix: 'bagviewer',
            featureType: "verblijfsobject",
            featureNS: "http://bagviewer.geonovum.nl",
            geometryName: "geometrie",
            srsName: "EPSG:28992",
            outputFormat: 'json',
            defaultFilter: null,
            handleRead: function(response) {
                var features = new OpenLayers.Format.GeoJSON().read(JSON.parse(response.priv.responseText));
                //_obj.vbo_layer.addFeatures(features);
                return callback(features);
                //for (var feat in features) {
                //    var e = {};
                //    e.feature = features[feat];
                //    _obj.getfeatureinfo(e);
                //}
            }
        });
        verblijfsobjectprotocol.read({filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: "identificatie",
                value: bagvboid})});
    },
    panel: function() {
        $('#bagpanel').hide();
    }
};
