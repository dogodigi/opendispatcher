var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.care = {
    id: "care",
    visibility: false,
    layer: {visibility: true},
    sel_array: [],
    sel_care: null,
    cql_array: ["'Prio 1'", "'Prio 2'", "'Prio 3'"],
    updateLayerIncident: function(string) {
        var _obj = dbkjs.modules.care;
        _obj.layerIncident.mergeNewParams({'time': string});
    },
    updateSelectieIncident: function() {
        var _obj = dbkjs.modules.care;
        _obj.layerIncident.mergeNewParams({
            cql_filter: "priority IN (" + _obj.cql_array.join() + ") " 
                + dbkjs.modules.filter.getFilter()});
    },
    register: function(options) {
        var _obj = dbkjs.modules.care;
        $('#btngrp_3').append('<a id="btn_care" class="btn btn-default navbar-btn" href="#" title="Management informatie"><i class="icon-fire"></i></a>');
        $('body').append(dbkjs.util.createDialog('carepanel', '<i class="icon-fire"></i> Details', 'right:0;bottom:0;'));
        $('#btn_care').click(function() {
            $('#care_dialog').toggle();
        });
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        //current year, current month, current day
        // moment.js, wat een mooie javascript bibliotheek

        _obj.layerIncident = new OpenLayers.Layer.WMS(
                "Incidenten",
                _obj.url + 'dbk/wms', {
                    layers: _obj.namespace + ':incidentsgebied',
                    format: 'image/png',
                    transparent: true,
                    time: '',
                    styles: 'prio',
                    cql_filter: "priority IN (" + _obj.cql_array.join() + ") "

                }, {
            transitionEffect: 'none',
            singleTile: true,
            buffer: 0,
            isBaseLayer: false,
            visibility: false,
            attribution: "Falck"
        }
        );
        _obj.layerIncident.dbkjsParent = _obj;
        _obj.layerNorm = new OpenLayers.Layer.WMS(
                "Dekkingsplan",
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
        _obj.layerIncident.dbkjsParent = _obj;
        this.updateLayerIncident();
        _obj.layerIncident.events.register("loadstart", _obj.layerIncident, function() {
            dbkjs.util.loadingStart(_obj.layerIncident);
        });

        _obj.layerIncident.events.register("loadend", _obj.layerIncident, function() {
            dbkjs.util.loadingEnd(_obj.layerIncident);
        });
        _obj.layerNorm.events.register("loadstart", _obj.layerNorm, function() {
            dbkjs.util.loadingStart(_obj.layerNorm);
        });
        _obj.layerNorm.events.register("loadend", _obj.layerNorm, function() {
            dbkjs.util.loadingEnd(_obj.layerNorm);
        });
        dbkjs.map.addLayers([_obj.layerIncident, _obj.layerNorm]);

        //Care heeft zijn eigen panel:
        _obj.dialog = dbkjs.util.createDialog('care_dialog', '<i class="icon-fire"></i> Incidenten en dekkingsplan');
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
            _obj.updateLayerIncident(start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD'));
        });
        _obj.sel_care.val(default_range);
        _obj.updateLayerIncident(default_range);
        incidentSel.append('<h5>Prioriteit</h5>');
        incidentSel.append(dbkjs.util.createListGroup(
                [
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>Prio 1</span>',
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>Prio 2</span>',
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>Prio 3</span>'
                ]
                ));
        incidentSel.append(dbkjs.util.createListGroup(
                [
                    '<input name="chk_koppel" type="checkbox"/><span>Gekoppeld aan dekkingsplan</span>'
                ]
                ));
        //_obj.dialog.show();
        var incidenten_button = $('<button class="btn btn-block btn_5px" type="button">Incidenten aan</button>');
        var dekkingsplan_button = $('<button class="btn btn-block btn_5px" type="button">Dekkingsplan aan</button>');
        var rapportage_button = $('<button class="btn btn-block btn_5px" type="button">Rapportage</button>');
        var rop_button = $('<button class="btn btn-block btn_5px" type="button">ROP</button>');
        if (_obj.layerIncident.getVisibility()) {
            incidentSel.show();
            incidenten_button.addClass('btn-primary').html('Incidenten uit');
        }
        if (_obj.layerNorm.getVisibility()) {
            normSel.show();
            dekkingsplan_button.addClass('btn-primary').html('Dekkingsplan uit');
        }

        $(rapportage_button).click(function() {
            window.open('https://brwbn.safetyportal.nl/');
            return false;
        });
        $(rop_button).click(function() {
            window.open('https://rop.bbnweb.nl/');
            return false;
        });
        $(incidenten_button).click(function() {
            incidentSel.toggle();
            if (_obj.layerIncident.getVisibility()) {
                incidenten_button.removeClass('btn-primary').html('Incidenten aan');
                _obj.layerIncident.setVisibility(false);
            } else {
                incidenten_button.addClass('btn-primary').html('Incidenten uit');
                _obj.layerIncident.setVisibility(true);
            }
        });
        $(dekkingsplan_button).click(function() {
            normSel.toggle();
            if (_obj.layerNorm.getVisibility()) {
                dekkingsplan_button.removeClass('btn-primary').html('Dekkingsplan aan');
                _obj.layerNorm.setVisibility(false);
            } else {
                dekkingsplan_button.addClass('btn-primary').html('Dekkingsplan uit');
                _obj.layerNorm.setVisibility(true);
            }
        });
        $('#care_dialog_b').append(incidenten_button);
        $('#care_dialog_b').append(incidentSel);
        $('#care_dialog_b').append(dekkingsplan_button);
        $('#care_dialog_b').append(normSel);
        $('#care_dialog_b').append(rapportage_button);
        $('#care_dialog_b').append(rop_button);
        $('input[name="chk_koppel"]').click(function() {
            $.each($('input[name="chk_koppel"]'), function(chk_idx, chk) {
                if ($(chk).is(':checked')) {
                    _obj.layerIncident.mergeNewParams({typename: _obj.namespace + ":incidentscare", layers: _obj.namespace + ":incidentscare", styles: 'careincidenten'});
                } else {
                    _obj.layerIncident.mergeNewParams({typename: _obj.namespace + ":incidentsgebied", layers: _obj.namespace + ":incidentsgebied", styles: 'prio'});
                }
            });

        });
        $('input[name="chk_prio"]').click(function() {
            var arr = [];
            $.each($('input[name="chk_prio"]'), function(chk_idx, chk) {
                if ($(chk).is(':checked')) {
                    arr.push("'" + $(chk).next().text() + "'");
                }
            });
            _obj.cql_array = arr;
            _obj.layerIncident.mergeNewParams({'cql_filter': "priority IN (" + 
                _obj.cql_array.join() + ")"});

        });
    },
    getfeatureinfo: function(e) {
        if (this.layerIncident.getVisibility()) {
            this.getIncidentInfo(e);
        }
        if (this.layerNorm.getVisibility()) {
            this.getNormInfo(e);
        }
    },
    getNormInfo: function(e) {
        var _obj = dbkjs.modules.care;
        var llMin = dbkjs.map.getLonLatFromPixel(new OpenLayers.Pixel(e.xy.x - 12, e.xy.y + 12));
        var llMax = dbkjs.map.getLonLatFromPixel(new OpenLayers.Pixel(e.xy.x + 12, e.xy.y - 12));

        var params = {
            //mydata.bbox = dbkjs.map.getExtent().toBBOX(0);
            srs: _obj.layerNorm.params.SRS,
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.namespace + ":normen",
            maxFeatures: 1,
            outputFormat: "json"
        };

        if (_obj.layerNorm.params.CQL_FILTER) {
            params.CQL_FILTER = _obj.layerNorm.params.CQL_FILTER;
            params.CQL_FILTER += ' AND ' + 'BBOX(the_geom,' + llMin.lon + "," + llMin.lat + "," + llMax.lon + "," + llMax.lat + ",'EPSG:28992')";
        } else {
            params.CQL_FILTER = 'BBOX(the_geom,' + llMin.lon + "," + llMin.lat + "," + llMax.lon + "," + llMax.lat + ",'EPSG:28992')";
        }


        OpenLayers.Request.GET({url: _obj.url + 'wfs', "params": params, callback: _obj.panelNorm});
        //OpenLayers.Event.stop(e);
    },
    getIncidentInfo: function(e) {
        var _obj = dbkjs.modules.care;
        var llMin = dbkjs.map.getLonLatFromPixel(new OpenLayers.Pixel(e.xy.x - 12, e.xy.y + 12));
        var llMax = dbkjs.map.getLonLatFromPixel(new OpenLayers.Pixel(e.xy.x + 12, e.xy.y - 12));
        if (dbkjs.util.isJsonNull(_obj.layerIncident.params.TYPENAME)) {
            _obj.layerIncident.params.TYPENAME = _obj.namespace + ':incidentsgebied';
        }
        var params = {
            //mydata.bbox = dbkjs.map.getExtent().toBBOX(0);
            srs: _obj.layerIncident.params.SRS,
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.layerIncident.params.TYPENAME,
            maxFeatures: 1,
            outputFormat: "json"
        };

        if (_obj.layerIncident.params.CQL_FILTER) {
            params.CQL_FILTER = _obj.layerIncident.params.CQL_FILTER;
            params.CQL_FILTER += ' AND ' + 'BBOX(the_geom,' + llMin.lon + "," + llMin.lat + "," + llMax.lon + "," + llMax.lat + ",'EPSG:28992')";
        } else {
            params.CQL_FILTER = 'BBOX(the_geom,' + llMin.lon + "," + llMin.lat + "," + llMax.lon + "," + llMax.lat + ",'EPSG:28992')";
        }
        if (_obj.layerIncident.params.TIME) {
            var time_col = 'datetimereported';
            var time_arr = _obj.layerIncident.params.TIME.split('/');
            var cql_string = time_col + " >='" + time_arr[0] + "' AND " + time_col + " <='" + time_arr[1] + "'";
            if (params.CQL_FILTER) {
                params.CQL_FILTER += ' AND ' + cql_string;
            } else {
                params.CQL_FILTER = cql_string;
            }
        }
        OpenLayers.Request.GET({url: _obj.url + 'wfs', "params": params, callback: _obj.panelIncident});
    },
    panelIncident: function(response) {
        var _obj = dbkjs.modules.care;
        //verwerk de featureinformatie
        //g = new OpenLayers.Format.GML.v3();
        var geojson_format = new OpenLayers.Format.GeoJSON();
        var features = geojson_format.read(response.responseText);
        if (features.length > 0) {
            $('#carepanel_b').html('');
            dbkjs.util.changeDialogTitle('Incidenten', '#carepanel');
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
                if (!dbkjs.util.isJsonNull(features[feat].attributes.firestation)) {
                    ft_tbl.append('<tr><td>Post</td><td>' + features[feat].attributes.firestation + '</td></tr>');
                }
                if (features[feat].attributes.timespanintake !== 0) {
                    ft_tbl.append('<tr><td>Aannametijd multi</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanintake, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanissued !== 0) {
                    ft_tbl.append('<tr><td>Aanname en uitgiftetijd BRW</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanissued, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanprocessing !== 0) {
                    ft_tbl.append('<tr><td>Verwerkingstijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanprocessing, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespandeparted !== 0) {
                    ft_tbl.append('<tr><td>Uitruktijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespandeparted, "seconds")) + '</td></tr>');
                }

                if (features[feat].attributes.timespandrivetime !== 0) {
                    ft_tbl.append('<tr><td>Aanrijdtijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespandrivetime, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanattended !== 0) {
                    ft_tbl.append('<tr><td>Opkomsttijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanattended, "seconds")) + '</td></tr>');
                }
                if (features[feat].attributes.timespanonscene !== 0) {
                    ft_tbl.append('<tr><td>Inzettijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(features[feat].attributes.timespanonscene, "seconds")) + '</td></tr>');
                }
                if (!dbkjs.util.isJsonNull(features[feat].attributes.objecttype)) {
                    ft_tbl.append('<tr><td>Functie</td><td>' + features[feat].attributes.objecttype + '</td></tr>');
                }
                if (!dbkjs.util.isJsonNull(features[feat].attributes.objectyearconstructed)) {
                    ft_tbl.append('<tr><td>Bouwjaar</td><td>' + features[feat].attributes.objectyearconstructed + '</td></tr>');
                }
                if (!dbkjs.util.isJsonNull(features[feat].attributes.sit1name)) {
                    ft_tbl.append(dbkjs.util.createNorm(
                            features[feat].attributes.sit1name,
                            features[feat].attributes.sit1timespanarrivalfirstunit,
                            features[feat].attributes.sit1maxtimespanarrivalfirstunit
                            ));
                }
                if (!dbkjs.util.isJsonNull(features[feat].attributes.sit2name)) {
                    ft_tbl.append(dbkjs.util.createNorm(
                            features[feat].attributes.sit2name,
                            features[feat].attributes.sit2timespanarrivalfirstunit,
                            features[feat].attributes.sit2maxtimespanarrivalfirstunit
                            ));
                }
                if (!dbkjs.util.isJsonNull(features[feat].attributes.sit3name)) {
                    ft_tbl.append(dbkjs.util.createNorm(
                            features[feat].attributes.sit3name,
                            features[feat].attributes.sit3timespanarrivalfirstunit,
                            features[feat].attributes.sit3maxtimespanarrivalfirstunit
                            ));
                }
            }
            ft_div.append(ft_tbl);
            $('#carepanel_b').append(ft_div);
            $('#carepanel_f').html('');
            $('#carepanel').show();
            $(".export").on('click', function() {
                // CSV
                dbkjs.util.exportTableToCSV.apply(this, [$('#incidenten_export'), 'export.csv']);
                $('#carepanel').toggle(true);
            });
        } else {
            //$('#carepanel').hide();
        }


    },
    panelNorm: function(response) {
        var _obj = dbkjs.modules.care;
        //verwerk de featureinformatie
        //g = new OpenLayers.Format.GML.v3();
        var geojson_format = new OpenLayers.Format.GeoJSON();
        var features = geojson_format.read(response.responseText);
        if (features.length > 0) {
            $('#carepanel_b').html('');
            dbkjs.util.changeDialogTitle('Dekkingsplan');
            var ft_div = $('<div class="table-responsive"></div>');
            var ft_tbl = $('<table id="incidenten_export" class="table table-hover table-condensed"></table>');

            for (var feat in features) {
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
                ft_tbl.append('<tr><td>Functie</td><td>' + features[feat].attributes.objecttype + '</td></tr>');
                ft_tbl.append('<tr><td>Bouwjaar</td><td>' + features[feat].attributes.objectyearconstructed + '</td></tr>');
                ft_tbl.append(dbkjs.util.createNorm(
                        features[feat].attributes.sit1name,
                        features[feat].attributes.sit1timespanarrivalfirstunit,
                        features[feat].attributes.sit1maxtimespanarrivalfirstunit
                        ));
                ft_tbl.append(dbkjs.util.createNorm(
                        features[feat].attributes.sit2name,
                        features[feat].attributes.sit2timespanarrivalfirstunit,
                        features[feat].attributes.sit2maxtimespanarrivalfirstunit
                        ));
                ft_tbl.append(dbkjs.util.createNorm(
                        features[feat].attributes.sit3name,
                        features[feat].attributes.sit3timespanarrivalfirstunit,
                        features[feat].attributes.sit3maxtimespanarrivalfirstunit
                        ));
            }
            ft_div.append(ft_tbl);
            $('#carepanel_b').append(ft_div);
            $('#carepanel_f').html('');
            $('#carepanel').show();
            $(".export").on('click', function() {
                // CSV
                dbkjs.util.exportTableToCSV.apply(this, [$('#dekkingsplan_export'), 'export.csv']);
                $('#carepanel').toggle(true);
            });
        } else {
            //$('#carepanel').hide();
        }


    }
};
