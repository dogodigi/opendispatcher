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
    updateFilter:  function(dbk_id) {
        var cql_filter = "";
        if(typeof(dbk_id) !== "undefined"){
            //de cql filter moet worden losgelaten op ALLE lagen voor de WMS request
            cql_filter = "DBK_ID=" + dbk_id + ';DBK_ID=' + dbk_id;
            this.layer.mergeNewParams({'CQL_FILTER': cql_filter });
        } else {
            delete this.layer.params.CQL_FILTER;
        }
        this.layer.redraw();
        return false;
    },
    show: function(activate) {
        this.layer = new OpenLayers.Layer.WMS("Objecten", this.url,
                {layers: this.namespace + ':WFS_tblDBK_Polygon,' + this.namespace + ':WFS_tblUitrukroute', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: true, attribution: "Falck", maxResolution: 6.71});
        if (activate === true) {
            map.addLayers([
                this.layer
            ]);
        }
        // vinkje op webpagina aan/uitzetten
        var dv_div = $('<li id="div_' + this.id + '" class="ovl"></li>');
        dv_div.append('<a href="#">' + this.layer.name + '</a>');
        $('#overlaypanel_b').append(dv_div);
        if (dbkobject.layer.getVisibility()) {
            dv_div.addClass('active');
        }
        $('#div_' + this.id).click(function() {
            if ($(this).hasClass('active')) {
                dbkobject.layer.setVisibility(false);
                $(this).removeClass('active');
            } else {
                dbkobject.layer.setVisibility(true);
                $(this).addClass('active');
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
        if(dbkobject.layer.params.CQL_FILTER){
            params.CQL_FILTER = dbkobject.layer.params.CQL_FILTER;
        }

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
            $('#infopanel_b').append(html);
            $('#infopanel_f').html('');
            $('#infopanel').toggle(true);
        }
    }
};
modules.push(dbkobject);
