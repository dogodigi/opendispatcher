/**
 * Objecten class, conform de DBK object definitie
 * 
 * Voor alle functionaliteit gerelateerd aan boringen
 */
var dbkobject = {
    id: "dbko",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    url: "/geoserver/zeeland/wms?",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie dbkobject.show() kan worden overruled
     */
    layer: null,
    highlightlayer: null,
    /**
     * Initialisatie functie om objecten toe te voegen aan de kaart 
     * @param {type} activate
     */
    show: function(activate) {
        this.layer = new OpenLayers.Layer.WMS("Objecten", this.url,
                {layers: this.namespace + ':WFS_tblDBK_Polygon,' + this.namespace + ':WFS_tblUitrukroute', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: true, attribution: "Falck"});
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
                dbkobject.layer.setVisibility(true);
            } else {
                dbkobject.layer.setVisibility(false);
            }
        });
        $('#div_' + this.id).click(function() {
            if ($(this).hasClass('aan')) {
                $(this).removeClass('aan');
                dbkobject.layer.setVisibility(false);
            } else {
                $(this).addClass('aan');
                dbkobject.layer.setVisibility(true);
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
            QUERY_LAYERS: dbkobject.layer.params.LAYERS,
            FEATURE_COUNT: 50,
            Layers: dbkobject.layer.params.LAYERS,
            WIDTH: map.size.w,
            HEIGHT: map.size.h,
            format: 'image/png',
            styles: dbkobject.layer.params.STYLES,
            srs: dbkobject.layer.params.SRS
        };

        // handle the wms 1.3 vs wms 1.1 madness
        if (dbkobject.layer.params.VERSION === "1.3.0") {
            params.version = "1.3.0";
            params.j = e.xy.x;
            params.i = e.xy.y;
        } else {
            params.version = "1.1.1";
            params.x = e.xy.x;
            params.y = e.xy.y;
        }
        OpenLayers.Request.GET({url: dbkobject.url, "params": params, callback: dbkobject.panel});
        OpenLayers.Event.stop(e);
    },
    panel: function(response) {
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();
        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="infocontent">';
            for (var feat in features) {
                //html += "Feature: Geometry: "+ features[feat].geometry+",";
                //map.zoomToExtent(features[feat].geometry.getBounds());
                html += '<h2>Object</h2>';
                html += "<table>";
                for (var j in features[feat].attributes) {
                    if (typeof(features[feat].attributes[j]) !== "undefined" && features[feat].attributes[j] !== "") {
                        html += '<tr><td><span class="infofieldtitle">' + j + "</span>: </td><td>" + features[feat].attributes[j] + "</td></tr>";
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
modules.push(dbkobject);
