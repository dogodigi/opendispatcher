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
    cql_array: ["'Prio 1'", "'Prio 2'", "'Prio 3'"],
    updateLayer: function(string) {
        var _obj = dbkjs.modules.care;
        _obj.layer.mergeNewParams({'time': string});
    },
    register: function(options) {
        var _obj = dbkjs.modules.care;
        $('#btngrp_3').append('<a id="btn_care" class="btn btn-default navbar-btn" href="#"><i class="icon-fire"></i></a>');
        $('#btn_care').click(function() {
            $('#care_dialog').toggle();
        });
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        //current year, current month, current day
        // moment.js, wat een mooie javascript bibliotheek

        _obj.layer = new OpenLayers.Layer.WMS(
                "Normtijden op verblijfsobjecten",
                _obj.url, {
            layers: _obj.namespace + ':incidents',
            format: 'image/png',
            transparent: true,
            time: '',
            styles: 'prio',
            cql_filter: "priority IN (" + _obj.cql_array.join() + ")"

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

        //Care heeft zijn eigen panel:
        _obj.dialog = dbkjs.util.createDialog('care_dialog', '<i class="icon-fire"></i> Incidenten en normen');
        $('body').append(_obj.dialog);
        _obj.sel_array = [];
        _obj.sel_care = $('<input id="sel_care" name="sel_care" type="text" class="form-control" placeholder="Kies een periode">');
        $('.dialog').drags({handle: '.panel-heading'});
        $('#care_dialog_b').append('<h5>Datumbereik</h5>');
        $('#care_dialog_b').append(_obj.sel_care);
        var default_range = moment().startOf('week').format('YYYY-MM-DD') + '/' + moment().endOf('week').format('YYYY-MM-DD');
        _obj.sel_care.daterangepicker({
            format: 'YYYY-MM-DD',
            startDate: moment().startOf('week').format('YYYY-MM-DD'),
            endDate: moment().endOf('week').format('YYYY-MM-DD')
        },
        function(start, end) {
            _obj.updateLayer(start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD'));
        });
        _obj.sel_care.val(default_range);
        _obj.updateLayer(default_range);
        //_obj.updateLayer(moment().format('YYYY-MM-DD'));
        $('#care_dialog_b').append('<h5>Prioriteit</h5>');
        $('#care_dialog_b').append(dbkjs.util.createListGroup(
                [
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>Prio 1</span>',
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>Prio 2</span>',
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>Prio 3</span>'
                ]
                ));
        $('input[name="chk_prio"]').click(function() {
            var arr = [];
            $.each($('input[name="chk_prio"]'), function(chk_idx, chk) {
                if ($(chk).is(':checked')) {
                    arr.push("'" + $(chk).next().text() + "'");
                }
            });
            _obj.layer.mergeNewParams({'cql_filter': "priority IN (" + arr.join() + ")"});
        });
        _obj.dialog.show();
        var incidenten_button = $('<button class="btn btn-block" type="button">Incidenten aan</button>');
        if (_obj.layer.getVisibility()) {
            incidenten_button.addClass('btn-primary').html('Incidenten uit');
        }
        $('#care_dialog_b').append(incidenten_button);
        $(incidenten_button).click(function() {
            if (_obj.layer.getVisibility()) {
                incidenten_button.removeClass('btn-primary').html('Incidenten aan');
                _obj.layer.setVisibility(false);
            } else {
                incidenten_button.addClass('btn-primary').html('Incidenten uit');
                _obj.layer.setVisibility(true);
            }
        });
        var download_button = $('<button class="btn btn-block btn-primary" type="button">Download</button>');
        $(download_button).click(function() {
            var _obj = dbkjs.modules.care;
            _obj.url;
            var mydata = {};
            //mydata.bbox = dbkjs.map.getExtent().toBBOX(0);
            mydata.service = "WFS";
            mydata.version = "1.0.0";
            mydata.request = "GetFeature";
            mydata.typename = _obj.namespace + ":incidents";
            mydata.maxFeatures = 100;
            mydata.outputFormat = "csv";
            if (_obj.layer.params.CQL_FILTER) {
                mydata.CQL_FILTER = _obj.layer.params.CQL_FILTER;
            }
            if (_obj.layer.params.TIME) {
                var time_col = 'datetimereported';
                var time_arr = _obj.layer.params.TIME.split('/');
                var cql_string = time_col + " >='" + time_arr[0] + "' AND " + time_col + " <='" + time_arr[1] + "'";
                if(mydata.CQL_FILTER){
                    mydata.CQL_FILTER += ' AND ' + cql_string;
                } else {
                    mydata.CQL_FILTER = cql_string;
                }
                //DATE_COL > '01.01.2012' AND DATE_COL < '31.12.2012'
            }
            var downloadstring = _obj.url + decodeURIComponent($.param(mydata));
            //http://safetymaps.nl/geoserver/brabantnoord/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=brabantnoord:gemeente_box&maxFeatures=50&outputFormat=application/json
            console.log(downloadstring);
            window.location = downloadstring;
        });
        $('#care_dialog_b').append(download_button);
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
            dbkjs.util.changeDialogTitle('Resultaat' + '<a href="#" class="export"><i class="icon-download"></i></a>');
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
