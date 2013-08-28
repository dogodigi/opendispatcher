var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};

/**
 * BAG class
 * 
 * Voor alle functionaliteit gerelateerd aan bag
 */
dbkjs.modules.bag = {
    id: "dbkbag",
    namespace: "bag",
    layer: null,
    activateVectors: function() {
        var _obj = dbkjs.modules.bag;
        var pandstylemap = new OpenLayers.StyleMap({
            fillColor: "yellow",
            fillOpacity: 0.4,
            strokeColor: "red",
            strokeWidth: 2,
            pointRadius: 5
        });
        var vbostylemap = new OpenLayers.StyleMap({
            fillColor: "black",
            fillOpacity: 0.4,
            strokeColor: "black",
            strokeWidth: 1,
            pointRadius: 3
        });
        var pandfilter = new OpenLayers.Filter.Comparison({
            type: OpenLayers.Filter.Comparison.EQUAL_TO,
            property: "identificatie",
            value: 0
        });
        var pandprotocol = new OpenLayers.Protocol.WFS({
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
                    _obj.vbo_layer.filter = new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "pandidentificatie",
                        value: features[feat].attributes.identificatie
                    });
                    _obj.vbo_layer.refresh({force: true});
                    return false;
                }
                //Direct de featureinfo tonen.

            }
        });
        var verblijfsobjectfilter = new OpenLayers.Filter.Comparison({
            type: OpenLayers.Filter.Comparison.EQUAL_TO,
            property: "pandidentificatie",
            value: 0
        });
        var verblijfsobjectprotocol = new OpenLayers.Protocol.WFS({
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
                    var e = {};
                    e.feature = features[feat];
                    _obj.getfeatureinfo(e);
                }
            }
        });

        _obj.pand_layer = new OpenLayers.Layer.Vector("BAG panden", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: pandprotocol,
            filter: pandfilter,
            styleMap: pandstylemap
        });

        _obj.vbo_layer = new OpenLayers.Layer.Vector("BAG verblijfsobjecten", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: verblijfsobjectprotocol,
            filter: verblijfsobjectfilter,
            styleMap: vbostylemap
        });
        dbkjs.map.addLayers([_obj.pand_layer, _obj.vbo_layer]);
        _obj.pand_layer.events.on({
            "featureselected": _obj.getfeatureinfo
        });
        _obj.vbo_layer.events.on({
            "featureselected": _obj.getfeatureinfo
        });
    },
    /**
     * Initialisatie functie om objecten toe te voegen aan de kaart
     */
    register: function() {
        var _obj = dbkjs.modules.bag;
        _obj.layer = new OpenLayers.Layer.WMS("BAG", "/bag/wms?",
                {layers: 'pand,standplaats,ligplaats', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: false});


        dbkjs.map.addLayers([
            _obj.layer
        ]);
        dbkjs.map.setLayerIndex(_obj.layer, 0);

        // vinkje op webpagina aan/uitzetten
        var dv_panel = $('<div class="panel"></div>');
        var dv_panel_heading = $('<div class="panel-heading"></div>');
        var dv_panel_title = $('<h4 class="panel-title"></div>');
        dv_panel_title.append('<input type="checkbox" name="box_' + _obj.id + '"/>&nbsp;');
        dv_panel_title.append(_obj.layer.name + '&nbsp;<a  class="accordion-toggle" data-toggle="collapse" href="#collapse_' + _obj.id + '" data-parent="#overlaypanel_b" ><i class="icon-info-sign"></i></a>');
        dv_panel_heading.append(dv_panel_title);
        dv_panel.append(dv_panel_heading);
        var dv_panel_content = $('<div id="collapse_' + _obj.id + '" class="panel-collapse collapse"></div>');
        dv_panel_content.append('<div class="panel-body">Bladiebla</div>');
        dv_panel.append(dv_panel_content);
        $('#overlaypanel_b').append(dv_panel);
        $('input[name="box_' + _obj.id + '"]').click(function() {
            if ($(this).is(':checked')) {
                _obj.layer.setVisibility(true);
            } else {
                _obj.layer.setVisibility(false);
            }
        });
        $('input[name="box_' + _obj.id + '"]').click(function() {
            if ($(this).hasClass('active')) {
                _obj.layer.setVisibility(false);
                var bagpand_lyr = dbkjs.map.getLayersByName('BAG panden')[0];
                var bagvbo_lyr = dbkjs.map.getLayersByName('BAG verblijfsobjecten')[0];
                if (bagpand_lyr) {
                    dbkjs.map.removeLayer(bagpand_lyr);
                }
                if (bagvbo_lyr) {
                    dbkjs.map.removeLayer(bagvbo_lyr);
                }
                $(this).removeClass('active');
            } else {
                _obj.layer.setVisibility(true);
                _obj.activateVectors();
                $(this).addClass('active');
            }
        });
    },
    featureInfohtml: function(feature) {
        var ret_title = $('<div class="tab-pane active" id="collapse_algemeen_' + feature.id + '"></div>');
        var ret_table_div = $('<div class="table-responsive"></div>');
        var ret_table = $('<table class="table table-hover"></table>');
        ret_table.append('<tr><th>veld</th><th>waarde</th></tr>');
        for (var j in feature.attributes) {
            if ($.inArray(j, ['identificatie', 'bouwjaar', 'status', 'gebruiksdoel', 'aantal_verblijfsobjecten', 'oppervlakte', 'openbare_ruimte',
                'huisnummer', 'huisletter', 'toevoeging', 'postcode', 'woonplaats']) > -1) {
                if (!dbkjs.util.isJsonNull(feature.attributes[j])) {
                    ret_table.append('<tr><td>' + j + "</td><td>" + feature.attributes[j] + "</td></tr>");
                }
            }
        }
        ret_table_div.append(ret_table);
        ret_title.append(ret_table_div);
        return ret_title;
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.bag;
        if (typeof(e.feature) !== "undefined") {
            $('#infopanel').append(_obj.featureInfohtml(e.feature));
            $('#infopanel').toggle(true);
        } else {
            _obj.pand_layer.destroyFeatures();
            _obj.vbo_layer.destroyFeatures();
            var lonLat = dbkjs.map.getLonLatFromViewPortPx(new OpenLayers.Pixel(e.xy.x, e.xy.y));
            _obj.pand_layer.filter = new OpenLayers.Filter.Spatial({
                type: OpenLayers.Filter.Spatial.CONTAINS,
                property: "geometrie",
                value: new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat)
            });
            _obj.pand_layer.refresh({force: true});
            return false;
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
        $('#infopanel_b').html('');
        $('#infopanel_f').html('');
        $('#infopanel').toggle(true);
    }
};
