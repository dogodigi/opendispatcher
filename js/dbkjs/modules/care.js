var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.care = {
    id: "care",
    url: "/zeeland/",
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
                "Incidenten",
                _obj.url + 'dbk/wms', {
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
        _obj.layer2 = new OpenLayers.Layer.WMS(
                "Normen",
                _obj.url + 'dbk/wms', {
            layers: _obj.namespace + ':normen',
            format: 'image/png',
            transparent: true,
            time: '',
            styles: 'Normen'
        }, {
            transitionEffect: 'none',
            singleTile: true,
            buffer: 0,
            isBaseLayer: false,
            visibility: false,
            attribution: "Falck"
        }
        );
        this.updateLayer();
        dbkjs.map.addLayers([_obj.layer, _obj.layer2]);

        //Care heeft zijn eigen panel:
        _obj.dialog = dbkjs.util.createDialog('care_dialog', '<i class="icon-fire"></i> Incidenten en normen');
        $('body').append(_obj.dialog);
        _obj.sel_care = $('<input id="sel_care" name="sel_care" type="text" class="form-control" placeholder="Kies een periode">');
        $('.dialog').drags({handle: '.panel-heading'});

        //_obj.updateLayer(moment().format('YYYY-MM-DD'));
        var incidentSel = $('<div id="incidentSel" style="display:none;"></div>');
        var normSel = $('<div id="normSel" style="display:none;"></div>');
        var normSel_minuten = $('<input id="sel_care" name="normSel_minuten" type="text" class="form-control" placeholder="Overschrijding in minuten">');
        normSel.append(normSel_minuten);
        incidentSel.append('<h5>Datumbereik</h5>');
        incidentSel.append(_obj.sel_care);
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
        incidentSel.append('<h5>Prioriteit</h5>');
        incidentSel.append(dbkjs.util.createListGroup(
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
        //_obj.dialog.show();
        var incidenten_button = $('<button class="btn btn-block" type="button">Incidenten aan</button>');
        var normen_button = $('<button class="btn btn-block" type="button">Normen aan</button>');
        if (_obj.layer.getVisibility()) {
            incidentSel.show();
            incidenten_button.addClass('btn-primary').html('Incidenten uit');

        }
        if (_obj.layer2.getVisibility()) {
            normSel.show();
            normen_button.addClass('btn-primary').html('Normen uit');
        }


        $(incidenten_button).click(function() {
            incidentSel.toggle();
            if (_obj.layer.getVisibility()) {
                incidenten_button.removeClass('btn-primary').html('Incidenten aan');
                _obj.layer.setVisibility(false);
            } else {
                incidenten_button.addClass('btn-primary').html('Incidenten uit');
                _obj.layer.setVisibility(true);
            }
        });
        $(normen_button).click(function() {
            normSel.toggle();
            if (_obj.layer2.getVisibility()) {
                normen_button.removeClass('btn-primary').html('Normen aan');
                _obj.layer2.setVisibility(false);
            } else {
                normen_button.addClass('btn-primary').html('Normen uit');
                _obj.layer2.setVisibility(true);
            }
        });
        var download_button = $('<button class="btn btn-block btn-primary" type="button">Download</button>');
        $(download_button).click(function() {
            var _obj = dbkjs.modules.care;
            _obj.url;
            var params = {
                //mydata.bbox = dbkjs.map.getExtent().toBBOX(0);
                service: "WFS",
                version: "1.0.0",
                request: "GetFeature",
                typename: _obj.namespace + ":incidents",
                outputFormat: "csv"
            };
            if (_obj.layer.params.CQL_FILTER) {
                params.CQL_FILTER = _obj.layer.params.CQL_FILTER;
            }
            if (_obj.layer.params.TIME) {
                var time_col = 'datetimereported';
                var time_arr = _obj.layer.params.TIME.split('/');
                var cql_string = time_col + " >='" + time_arr[0] + "' AND " + time_col + " <='" + time_arr[1] + "'";
                if (params.CQL_FILTER) {
                    params.CQL_FILTER += ' AND ' + cql_string;
                } else {
                    params.CQL_FILTER = cql_string;
                }
            }
            var downloadstring = _obj.url + 'wfs' + decodeURIComponent($.param(params));
            window.location = downloadstring;
        });
        incidentSel.append(download_button);
        $('#care_dialog_b').append(incidentSel);
        $('#care_dialog_b').append(incidenten_button);
        $('#care_dialog_b').append(normSel);
        $('#care_dialog_b').append(normen_button);
    },
    getfeatureinfo: function(e) {
        var _obj = dbkjs.modules.care;
        var llMin = dbkjs.map.getLonLatFromPixel(new OpenLayers.Pixel(e.xy.x - 12, e.xy.y + 12));
        var llMax = dbkjs.map.getLonLatFromPixel(new OpenLayers.Pixel(e.xy.x + 12, e.xy.y - 12));

        var params = {
            //mydata.bbox = dbkjs.map.getExtent().toBBOX(0);
            srs: _obj.layer.params.SRS,
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.namespace + ":incidents",
            maxFeatures: 1,
            outputFormat: "json"
        };

        if (_obj.layer.params.CQL_FILTER) {
            params.CQL_FILTER = _obj.layer.params.CQL_FILTER;
        }
        if (_obj.layer.params.TIME) {
            var time_col = 'datetimereported';
            var time_arr = _obj.layer.params.TIME.split('/');
            var cql_string = time_col + " >='" + time_arr[0] + "' AND " + time_col + " <='" + time_arr[1] + "'";
            if (params.CQL_FILTER) {
                params.CQL_FILTER += ' AND ' + cql_string;
            } else {
                params.CQL_FILTER = cql_string;
            }
            //DATE_COL > '01.01.2012' AND DATE_COL < '31.12.2012'
        }
        params.CQL_FILTER += ' AND ' + 'BBOX(the_geom,' + llMin.lon + "," + llMin.lat + "," + llMax.lon + "," + llMax.lat + ",'EPSG:28992')";
        OpenLayers.Request.GET({url: _obj.url + 'wfs', "params": params, callback: _obj.panel});
        //OpenLayers.Event.stop(e);
    },
    panel: function(response) {
        var _obj = dbkjs.modules.care;
        //verwerk de featureinformatie
        //g = new OpenLayers.Format.GML.v3();
        var geojson_format = new OpenLayers.Format.GeoJSON();
        var features = geojson_format.read(response.responseText);
        if (features.length > 0) {
            $('#infopanel_b').html('');
            dbkjs.util.changeDialogTitle('Incidenten');
            var ft_div = $('<div class="table-responsive"></div>');
            var ft_tbl = $('<table id="incidenten_export" class="table table-hover table-condensed"></table>');
            for (var feat in features) {
                ft_tbl.append('<tr><td colspan="2">' + dbkjs.util.createPriority(
                        features[feat].attributes.incidentnr,
                        features[feat].attributes.locationdescription,
                        features[feat].attributes.priority
                        ) + '</td></tr>'
                        );
                ft_tbl.append('<tr><td colspan="2">' + dbkjs.util.createClassification(
                        features[feat].attributes.classification1,
                        features[feat].attributes.classification2,
                        features[feat].attributes.classification3
                        ) + '</td></tr>');
                var datumtijd = moment(features[feat].attributes.datetimereported);
                ft_tbl.append('<tr><td colspan="2">' + dbkjs.util.createAddress(
                        features[feat].attributes.addresscity,
                        features[feat].attributes.addressmunicipality,
                        features[feat].attributes.addressstreet,
                        features[feat].attributes.addresshousenr,
                        features[feat].attributes.addresshousenradd,
                        features[feat].attributes.addressname,
                        features[feat].attributes.addresszipcode
                        ).html() +
                        '</td></tr>');
                ft_tbl.append('<tr><td>Datum/tijd</td><td>' + datumtijd.format('YYYY-MM-DD HH:mm:ss') + '</td></tr>');

                if (features[feat].attributes.timespanintake !== 0) {
                    ft_tbl.append('<tr><td>Intake</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanintake, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanprocessing !== 0) {
                    ft_tbl.append('<tr><td>Verwerking</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanprocessing, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanissued !== 0) {
                    ft_tbl.append('<tr><td>Alarmering</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanissued, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespandrivetime !== 0) {
                    ft_tbl.append('<tr><td>Aanrijdend</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespandrivetime, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanonscene !== 0) {
                    ft_tbl.append('<tr><td>Terplaatse</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanonscene, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanattended !== 0) {
                    ft_tbl.append('<tr><td>Timespanattended</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanattended, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespandeparted !== 0) {
                    ft_tbl.append('<tr><td>Timespandeparted</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespandeparted, "seconds")) + '</td></tr>');
                }
            }
            ft_div.append(ft_tbl);
            $('#infopanel_b').append(ft_div);
            $('#infopanel_f').html('');
            $('#infopanel').show();
            $(".export").on('click', function() {
                // CSV
                dbkjs.util.exportTableToCSV.apply(this, [$('#normen_export'), 'export.csv']);
                //dbkjs.util.exportTableToCSV($('#normen_export'), 'normen.csv');
                $('#infopanel').toggle(true);
            });
        }


    }
};
