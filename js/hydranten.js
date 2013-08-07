/**
 * Objecten class, conform de DBK object definitie
 * 
 * Voor alle functionaliteit gerelateerd aan boringen
 */
var hydranten = {
    id: "dbkhyd",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    url: "/geoserver/zeeland/wms?",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie hydranten.show() kan worden overruled
     */
    layer: null,
    show: function(activate) {
        this.layer = new OpenLayers.Layer.WMS("Hydranten", this.url,
                {layers: this.namespace + ':gwt2009v1', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: true, attribution: "BRWBN"});
        if (activate === true) {
            map.addLayers([
                this.layer
            ]);
        }
        // vinkje op webpagina aan/uitzetten
        var dv_div = $('<div id="div_' + this.id + '" class="ovl aan"></div>');
        var dv_cbx = $('<input type="checkbox" id="cbx_' + this.id + '" name="' + this.layer.name + '" />');
        dv_div.append(dv_cbx);
        dv_div.append(this.layer.name);
        $('#overlaypanel').append(dv_div);
        $('#cbx_' + this.id).attr('checked', this.layer.visibility);
        $('#cbx_' + this.id).click(function() {
            if (this.checked === true) {
                hydranten.layer.setVisibility(true);
            } else {
                hydranten.layer.setVisibility(false);
            }
        });
        $('#div_' + this.id).click(function() {
            if ($(this).hasClass('aan')) {
                $(this).removeClass('aan');
                hydranten.layer.setVisibility(false);
            } else {
                $(this).addClass('aan');
                hydranten.layer.setVisibility(true);
            }
        });
    },
    getfeatureinfo: function(e) {
        var params = {
            REQUEST: "GetFeatureInfo",
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            BBOX: map.getExtent().toBBOX(),
            SERVICE: "WMS",
            INFO_FORMAT: 'application/vnd.ogc.gml',
            QUERY_LAYERS: hydranten.layer.params.LAYERS,
            FEATURE_COUNT: 50,
            Layers: hydranten.layer.params.LAYERS,
            WIDTH: map.size.w,
            HEIGHT: map.size.h,
            format: 'image/png',
            styles: hydranten.layer.params.STYLES,
            srs: hydranten.layer.params.SRS
        };

        // handle the wms 1.3 vs wms 1.1 madness
        if (preparatie.layer.params.VERSION === "1.3.0") {
            params.version = "1.3.0";
            params.j = e.xy.x;
            params.i = e.xy.y;
        } else {
            params.version = "1.1.1";
            params.x = e.xy.x;
            params.y = e.xy.y;
        }
        OpenLayers.Request.GET({url: hydranten.url, "params": params, callback: hydranten.panel});
        //OpenLayers.Event.stop(e);
    },
    panel: function(response) {
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();

        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="infocontent">';
            html += '<h2>Hydranten</h2>';
            for (var feat in features) {
                html += '<table class="featureinfo">';
                for (var j in features[feat].attributes) {
                    if ($.inArray(j, ['Name', 'No', 'Latitude', 'Longitude']) > -1) {
                        if (typeof(features[feat].attributes[j]) !== "undefined" && features[feat].attributes[j] !== "") {
                            html += '<tr><td><span class="infofieldtitle">' + j + "</span>: </td><td>" + features[feat].attributes[j] + "</td></tr>";
                        }
                    }
                }
                html += "</table>";
            }
            html += '</div>';
            $('#infopanel').append(html);

            if (!$('#tb03').hasClass('close')) {
                $('#tb03').addClass('close');
            }
            $('#infopanel').toggle(true);
        }
    }
};
modules.push(hydranten);