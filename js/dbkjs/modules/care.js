var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.care = {
    id: "care",
    url: "/geoserver/zeeland/wms?",
    namespace: "zeeland",
    visibility: false,
    layer: null,
    sel_array: [],
    sel_care: null,
    updateSelection: function(val) {
        var _obj = dbkjs.modules.care;
        _obj.sel_array.push(val);
        _obj.sel_care.typeahead({
            name: 'verfijn_selectie',
            local: _obj.sel_array,
            limit: 5
        });
        _obj.sel_care.bind('typeahead:selected', function(obj, datum) {
            // @todo
        });
    },
    register: function(options) {
        var _obj = dbkjs.modules.care;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;

        _obj.layer = new OpenLayers.Layer.WMS(
                "Normtijden op verblijfsobjecten",
                _obj.url, {
            layers: _obj.namespace + ':Normen',
            format: 'image/png',
            transparent: true
        }, {
            transitionEffect: 'none',
            singleTile: true,
            buffer: 0,
            isBaseLayer: false,
            visibility: false,
            attribution: "Falck"
        }
        );
        dbkjs.map.addLayers([_obj.layer]);
        // vinkje op webpagina aan/uitzetten
        // vinkje op webpagina aan/uitzetten
        var dv_panel = $('<div class="panel"></div>');
        var dv_panel_heading = $('<div class="panel-heading"></div>');
        var dv_panel_title = $('<h4 class="panel-title"></div>');
        dv_panel_title.append('<input type="checkbox" name="box_' + _obj.id + '"/>&nbsp;');
        dv_panel_title.append(_obj.layer.name + '&nbsp;<a  class="accordion-toggle" data-toggle="collapse" href="#collapse_' +
                _obj.id + '" data-parent="#overlaypanel_b" ><i class="icon-info-sign"></i></a>');
        dv_panel_heading.append(dv_panel_title);
        dv_panel.append(dv_panel_heading);
        var dv_panel_content = $('<div id="collapse_' + _obj.id + '" class="panel-collapse collapse"></div>');
        var dv_panel_body = $('<div class="panel-body"></div>');
        dv_panel_body.append('<p>Selecteer een gebied om op te filteren:</p>');
        _obj.sel_array = [];
        _obj.sel_care = $('<input id="sel_care" name="sel_care" type="text" class="form-control" placeholder="Verfijn selectie">');
        dv_panel_body.append(_obj.sel_care);
        _obj.sel_care.daterangepicker();
        dv_panel_content.append(dv_panel_body);
        dv_panel.append(dv_panel_content);
        $('#overlaypanel_b').append(dv_panel);
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
        var _obj = dbkjs.modules.care;
        var params = {
            REQUEST: "GetFeatureInfo",
            EXCEPTIONS: "application/vnd.ogc.se_xml",
            BBOX: dbkjs.map.getExtent().toBBOX(),
            SERVICE: "WMS",
            INFO_FORMAT: 'application/vnd.ogc.gml',
            QUERY_LAYERS: _obj.layer.params.LAYERS,
            FEATURE_COUNT: 20,
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
            $('#infopanel_b').html('');
            var hide_us = ['Name', 'No', 'Latitude', 'Longitude', 'addressx', 'addressy', 'id'];
            var rename_us = {
                "addresshousenr": "huisnr",
                "addresscity": "gemeente",
                "addressmunicipality": "woonplaats",
                "addressstreet": "straat",
                "addresszipcode": "postcode",
                "objectyearconstructed": "bouwjr",
                "sit1maxtimespanarrivalfirstunit": "norm sit1",
                "sit1timespanarrivalfirstunit": "opkomst sit1",
                "sit1name": "sit1",
                "sit2maxtimespanarrivalfirstunit": "norm sit2",
                "sit2timespanarrivalfirstunit": "opkomst sit2",
                "sit2name": "sit2",
                "sit3maxtimespanarrivalfirstunit": "norm sit3",
                "sit3timespanarrivalfirstunit": "opkomst Sit3"
            };
            $("#infopanel_h").html('<span class="h4">Normen</span>&nbsp;<a href="#" class="export"><i class="icon-download"></i></a>');
            var ft_div = $('<div class="table-responsive"></div>');
            var ft_tbl = $('<table id="normen_export" class="table table-hover table-condensed table-bordered"></table>');
            var th_row = $('<tr></tr>');
            for (var j in features[0].attributes) {
                if ($.inArray(j, hide_us) === -1) {
                    if (rename_us[j]) {
                        th_row.append('<th>' + rename_us[j] + "</th>");
                    } else {
                        th_row.append('<th>' + j + "</th>");
                    }
                }
            }
            ft_tbl.append(th_row);
            for (var feat in features) {
                var ft_tr = $('<tr></tr>');
                for (var j in features[feat].attributes) {
                    if ($.inArray(j, hide_us) === -1) {
                        if (!dbkjs.util.isJsonNull(features[feat].attributes[j])) {
                            ft_tr.append('<td>' + features[feat].attributes[j] + '</td>');
                        } else {
                            ft_tr.append('<td>&nbsp;</td>');
                        }
                    }
                }
                ft_tbl.append(ft_tr);

            }
            ft_div.append(ft_tbl);
            // This must be a hyperlink


            // IF CSV, don't do event.preventDefault() or return false
            // We actually need this to be a typical hyperlink
        }

        $('#infopanel_b').append(ft_div);
        $('#infopanel_f').html('');
        $(".export").on('click', function() {
            // CSV
            dbkjs.util.exportTableToCSV.apply(this, [$('#normen_export'), 'export.csv']);
            //dbkjs.util.exportTableToCSV($('#normen_export'), 'normen.csv');
            $('#infopanel').toggle(true);
        });
    }
};
