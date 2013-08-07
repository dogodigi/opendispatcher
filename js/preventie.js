/**
 * Objecten class, conform de DBK object definitie
 * 
 * Voor alle functionaliteit gerelateerd aan boringen
 */
var preventie = {
    id: "dbkprev",
    title: "Preventieve voorzieningen",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    url: "/geoserver/zeeland/wms?",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie preventie.show() kan worden overruled
     */
    layer: null,
    highlightlayer: null,
     updateFilter:  function(dbk_id) {
        var cql_filter = "";
        if(typeof(dbk_id) !== "undefined"){
            cql_filter = "DBK_ID=" + dbk_id + ';DBK_ID=' + dbk_id +';DBK_ID=' + dbk_id;
            this.layer.mergeNewParams({'CQL_FILTER': cql_filter });
        } else {
            delete this.layer.params.CQL_FILTER;
        }
        this.layer.redraw();
        return false;
    },
    show: function(activate) {
        this.layer = new OpenLayers.Layer.WMS(this.title, this.url,
                {layers: this.namespace + ':WFS_tblCustom_Polyline,' + this.namespace + ':WFS_tblSymbol_Point,'+ this.namespace + ':WFS_tblLabels', format: 'image/png', transparent: true},
        {transitionEffect: 'none', singleTile: true, buffer: 0, isBaseLayer: false, visibility: true, attribution: "Falck", maxResolution: 6.71});
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
                preventie.layer.setVisibility(true);
            } else {
                preventie.layer.setVisibility(false);
            }
        });
        $('#div_' + this.id).click(function() {
            if ($(this).hasClass('aan')) {
                $(this).removeClass('aan');
                preventie.layer.setVisibility(false);
            } else {
                $(this).addClass('aan');
                preventie.layer.setVisibility(true);
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
            QUERY_LAYERS: preventie.layer.params.LAYERS,
            FEATURE_COUNT: 50,
            Layers: preventie.layer.params.LAYERS,
            WIDTH: map.size.w,
            HEIGHT: map.size.h,
            format: 'image/png',
            styles: preventie.layer.params.STYLES,
            srs: preventie.layer.params.SRS
        };

        // handle the wms 1.3 vs wms 1.1 madness
        if (preventie.layer.params.VERSION === "1.3.0") {
            params.version = "1.3.0";
            params.j = e.xy.x;
            params.i = e.xy.y;
        } else {
            params.version = "1.1.1";
            params.x = e.xy.x;
            params.y = e.xy.y;
        }
        OpenLayers.Request.GET({url: preventie.url, "params": params, callback: preventie.panel});
        OpenLayers.Event.stop(e);
    },
    panel: function(response) {
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();

        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="infocontent">';
            for (var feat in features) {
                html += '<h2>Preventie</h2>';
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
modules.push(preventie);
