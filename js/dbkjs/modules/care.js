var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.care = {
    id: "care",
    url: "/geoserver/zeeland/wms?",
    namespace: "zeeland",
    visibility: false,
    layer: null,
    register: function(options) {
        var _obj = dbkjs.modules.care;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;

        _obj.layer = new OpenLayers.Layer.WMS(
            "Normen", 
            _obj.url, {
                layers: _obj.namespace + ':CareObjects', 
                format: 'image/png', 
                transparent: true
            }, {
                transitionEffect: 'none', 
                singleTile: true, 
                buffer: 0, 
                isBaseLayer: false, 
                visibility: _obj.visibility, 
                attribution: "Falck"
            }
        );
        dbkjs.map.addLayers([_obj.layer]);
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
        if (_obj.layer.getVisibility()) {
            //checkbox aan
            $('input[name="box_' + _obj.id + '"]').attr('checked','checked');
        }
        $('input[name="box_' + _obj.id + '"]').click(function() {
            if($(this).is(':checked')) {
                _obj.layer.setVisibility(true);
            } else {
                _obj.layer.setVisibility(false);
            }
        });
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.care;
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
        OpenLayers.Request.GET({url: _obj.url, "params": params, callback: _obj.panel});
        //OpenLayers.Event.stop(e);
    },
    panel: function(response) {
        //verwerk de featureinformatie
        g = new OpenLayers.Format.GML.v3();

        features = g.read(response.responseText);
        if (features.length > 0) {
            html = '<div class="infocontent">';
            html += '<h2>Normen</h2>';
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
            $('#infopanel_b').append(html);
            $('#infopanel_f').html('');
            $('#infopanel').toggle(true);
        }
    }
};
