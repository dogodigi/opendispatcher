var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.object = {
    id: "dbko",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    url: "/geoserver/zeeland/wms?",
    namespace: "zeeland",
    /**
     * Laag. Wordt geiniteerd met de functie register(). kan worden overruled
     */
    layer: null,
    highlightlayer: null,
    /**
     * 
     * @param {type} dbk_id
     * @returns {Boolean}
     */
    updateFilter: function(dbk_id) {
        var _obj = dbkjs.modules.object;
        var cql_filter = "";
        if (typeof(dbk_id) !== "undefined") {
            //de cql filter moet worden losgelaten op ALLE lagen voor de WMS request
            cql_filter = "dbkfeature_id=" + dbk_id + ';dbkfeature_id=' + dbk_id + ';dbkfeature_id=' + dbk_id;
            _obj.layer.mergeNewParams({'CQL_FILTER': cql_filter});
        } else {
            delete _obj.layer.params.CQL_FILTER;
        }
        _obj.layer.redraw();
        return false;
    },
    register: function(options) {
        var _obj = dbkjs.modules.object;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.layer = new OpenLayers.Layer.WMS(
            "DBK Objecten en Gebieden",
            _obj.url + 'wms',
            {
                layers: _obj.namespace + ':WMS_Pandgeometrie,' + _obj.namespace + ':WMS_Gebied,' + _obj.namespace + ':WMS_ToegangTerrein',
                format: 'image/png',
                transparent: true
            }, {
                transitionEffect: 'none',
                singleTile: true,
                buffer: 0,
                isBaseLayer: false,
                visibility: _obj.visibility,
                attribution: "Falck",
                maxResolution: 6.71
        });
        
        dbkjs.map.addLayers([_obj.layer]);

        // vinkje op webpagina aan/uitzetten
        var dv_panel = $('<div class="panel" draggable="true"></div>');
        var dv_panel_heading = $('<div class="panel-heading"></div>');
        var dv_panel_title = $('<h4 class="panel-title"></div>');
        dv_panel_title.append('<input type="checkbox" name="box_' + _obj.id + '"/>&nbsp;');
        dv_panel_title.append(_obj.layer.name + '&nbsp;<a  class="accordion-toggle" data-toggle="collapse" href="#collapse_' + _obj.id + '" data-parent="#overlaypanel_b1" ><i class="icon-info-sign"></i></a>');
        dv_panel_heading.append(dv_panel_title);
        dv_panel.append(dv_panel_heading);
        var dv_panel_content = $('<div id="collapse_' + _obj.id + '" class="panel-collapse collapse"></div>');
        dv_panel_content.append('<div class="panel-body"><p>Zet de DBK objecten en de bijbehorende uitrukroutes aan of uit.</p><p>' +
                '<div class="row"><div class="col-xs-2 text-center"><i class="icon-long-arrow-right" style="color:#ff0000;"></i></div><div class="col-xs-10"> Primaire uitrukroutes</div></div>' +
                '<div class="row"><div class="col-xs-2 text-center"><i class="icon-long-arrow-right" style="color:#00ff00;"></i></div><div class="col-xs-10"> Secundaire uitrukroutes</div></div>' +
                '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#82FA58;border:2px solid #00ff00;">&nbsp;</div></div><div class="col-xs-10"> Objecten</div></div>' +
                '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#ffffff;border:2px solid #FFFF00;">&nbsp;</div></div><div class="col-xs-10"> Objectcontouren (ver ingezoomd)</div></div>' +
                '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#F7BE81;border:2px solid #B45F04;">&nbsp;</div></div><div class="col-xs-10"> Gebieden</div></div>' +
                '<div class="row"><div class="col-xs-2"><div style="margin:4px 0 4px 0;background-color:#ffffff;border:2px solid #B45F04;">&nbsp;</div></div><div class="col-xs-10"> Gebiedcontouren (ver ingezoomd)</div></div>' +
                '</p></div>');
        dv_panel.append(dv_panel_content);
        $('#overlaypanel_b1').append(dv_panel);
        if (_obj.layer.getVisibility()) {
            //checkbox aan
            $('input[name="box_' + _obj.id + '"]').attr('checked', 'checked');
        }
        $('input[name="box_' + _obj.id + '"]').click(function() {
            if ($(this).is(':checked')) {
                _obj.layer.setVisibility(true);
            } else {
                _obj.layer.setVisibility(false);
            }
        });
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.object;
        var params = {
            REQUEST: "GetFeatureInfo",
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            BBOX: dbkjs.map.getExtent().toBBOX(),
            SERVICE: "WMS",
            INFO_FORMAT: 'application/vnd.ogc.gml',
            QUERY_LAYERS: _obj.layer.params.LAYERS,
            FEATURE_COUNT: 50,
            Layers: _obj.layer.params.LAYERS,
            WIDTH: dbkjs.map.size.w,
            HEIGHT: dbkjs.map.size.h,
            format: 'image/png',
            styles: _obj.layer.params.STYLES,
            srs: _obj.layer.params.SRS
        };
        if (_obj.layer.params.CQL_FILTER) {
            params.CQL_FILTER = _obj.layer.params.CQL_FILTER;
        }

        // handle the wms 1.3 vs wms 1.1 madness
        if (_obj.layer.params.VERSION === "1.3.0") {
            params.version = "1.3.0";
            params.j = e.xy.x;
            params.i = e.xy.y;
        } else {
            params.version = "1.1.1";
            params.x = e.xy.x;
            params.y = e.xy.y;
        }
        OpenLayers.Request.GET({url: _obj.url + 'wms', "params": params, callback: _obj.panel});
        OpenLayers.Event.stop(e);
    },
    panel: function(response) {
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();
        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="infocontent">';
            for (var feat in features) {
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
            $('#infopanel').show();
        }
    }
};
