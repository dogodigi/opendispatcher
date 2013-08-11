/**
 * BAG class
 * 
 * Voor alle functionaliteit gerelateerd aan bag
 */
var bag = {
    id: "dbkbag",
    namespace: "bag",
    layer: null,
    activateVectors: function() {
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
            srsName: "EPSG:28992",
            outputFormat: 'json',
            handleRead: function(response) {
                var features = new OpenLayers.Format.GeoJSON().read(JSON.parse(response.priv.responseText));
                bag.pand_layer.addFeatures(features);
                bag.vbo_layer.filter = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: "pandidentificatie",
                    value: 0
                });
                for (var feat in features) {
                    var e = {};
                    e.feature = features[feat];
                    bag.getfeatureinfo(e);
                    bag.vbo_layer.filter = new OpenLayers.Filter.Comparison({
                        type: OpenLayers.Filter.Comparison.EQUAL_TO,
                        property: "pandidentificatie",
                        value: features[feat].attributes.identificatie
                    });
                    bag.vbo_layer.refresh({force: true});
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
                bag.vbo_layer.addFeatures(features);
                for (var feat in features) {
                    var e = {};
                    e.feature = features[feat];
                    bag.getfeatureinfo(e);
                }
            }
        });

        bag.pand_layer = new OpenLayers.Layer.Vector("BAG panden", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: pandprotocol,
            filter: pandfilter,
            styleMap: pandstylemap
        });

        bag.vbo_layer = new OpenLayers.Layer.Vector("BAG verblijfsobjecten", {
            strategies: [new OpenLayers.Strategy.BBOX()],
            protocol: verblijfsobjectprotocol,
            filter: verblijfsobjectfilter,
            styleMap: vbostylemap
        });
        map.addLayers([bag.pand_layer, bag.vbo_layer]);
        bag.pand_layer.events.on({
            "featureselected": bag.getfeatureinfo
        });
        bag.vbo_layer.events.on({
            "featureselected": bag.getfeatureinfo
        });
    },
    /**
     * Initialisatie functie om objecten toe te voegen aan de kaart
     * @param {type} activate
     */
    show: function(activate) {
        bag.layer = new OpenLayers.Layer.WMS("BAG", "/bag/wms?",
                {layers: 'pand,standplaats,ligplaats', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: false});


        map.addLayers([
            bag.layer
        ]);
        map.setLayerIndex(bag.layer, 0);
        
        // vinkje op webpagina aan/uitzetten
        var dv_div = $('<li id="div_' + this.id + '" class="ovl"></li>');
        dv_div.append('<a href="#">' + this.layer.name + '</a>');
        $('#overlaypanel_b').append(dv_div);
        if (bag.layer.getVisibility()) {
            dv_div.addClass('active');
        }
        $('#div_' + this.id).click(function() {
            if ($(this).hasClass('active')) {
                bag.layer.setVisibility(false);
                var bagpand_lyr = map.getLayersByName('BAG panden')[0];
                var bagvbo_lyr = map.getLayersByName('BAG verblijfsobjecten')[0];
                if (bagpand_lyr){
                    map.removeLayer(bagpand_lyr);
                }
                if (bagvbo_lyr){
                    map.removeLayer(bagvbo_lyr);
                }
                $(this).removeClass('active');
            } else {
                bag.layer.setVisibility(true);
                bag.activateVectors();
                $(this).addClass('active');
            }
        });
    },
    featureInfohtml: function(feature) {
        var ret_title = $('<table></table>');
        for (var j in feature.attributes) {
            if ($.inArray(j, ['identificatie', 'bouwjaar', 'status', 'gebruiksdoel', 'aantal_verblijfsobjecten', 'oppervlakte', 'openbare_ruimte',
                'huisnummer', 'huisletter', 'toevoeging', 'postcode', 'woonplaats']) > -1) {
                if (!isJsonNull(feature.attributes[j])) {
                    ret_title.append('<tr><td><span class="infofieldtitle">' + j + "</span>: </td><td>" + feature.attributes[j] + "</td></tr>");
                }
            }
        }
        return ret_title;
    },
    getfeatureinfo: function(e) {
        if (typeof(e.feature) !== "undefined") {
            if ($('#baginfo').length === 0) {
                $('#infopanel_b').append('<div id="baginfo" class="tab-content"><h2>BAG gegevens</h2></div>');
            }
            var mybaginfo = $('#baginfo');
            var mytable = $('<table></table>');
            mytable.append(bag.featureInfohtml(e.feature));
            mybaginfo.append(mytable);

            $('#infopanel').toggle(true);
        } else {
            //console.log("bag klik zonder feature");
//            <ogc:Contains>
//                <ogc:PropertyName>geometrie</ogc:PropertyName>
//                <gml:Point xmlns:gml="http://www.opengis.net/gml">
//                    <gml:pos>123040.84 434573.96</gml:pos>
//                </gml:Point>
//            </ogc:Contains>
            bag.pand_layer.destroyFeatures();
            bag.vbo_layer.destroyFeatures();
            var lonLat = map.getLonLatFromViewPortPx(new OpenLayers.Pixel(e.xy.x, e.xy.y));
            bag.pand_layer.filter = new OpenLayers.Filter.Spatial({
                type: OpenLayers.Filter.Spatial.CONTAINS,
                property: "geometrie",
                value: new OpenLayers.Geometry.Point(lonLat.lon, lonLat.lat)
            });
            bag.pand_layer.refresh({force: true});
            return false;
        }
    },
    panel: function() {
        //verwerk de featureinformatie
        $('#infopanel_b').html('');
        $('#infopanel_f').html('');
        $('#infopanel').toggle(true);
    }
};
modules.push(bag);
