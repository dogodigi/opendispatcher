/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 * 
 *  This file is part of safetymapDBK
 *  
 *  safetymapDBK is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  safetymapDBK is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 *
 */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.care = {
    id: "dbk.modules.care",
    visibility: false,
    classification1: "",
    classification2: "",
    classification3: "",
    layer: {visibility: true},
    sel_array: [],
    sel_care: null,
    cql_array: ["'Prio 1'", "'Prio 2'", "'Prio 3'"],
    updateLayerIncident: function (string) {
        var _obj = dbkjs.modules.care;
        _obj.layerIncident.mergeNewParams({'time': string});
    },
    updateSelectieIncident: function () {
        var _obj = dbkjs.modules.care;
        _obj.refreshCQL();
    },
    register: function (options) {
        var _obj = dbkjs.modules.care;
        $('#btngrp_3').append('<a id="btn_care" class="btn btn-default navbar-btn" href="#" title="' +
                i18n.t('care.managementinfo') + '"><i class="fa fa-fire"></i></a>');
        $('body').append(dbkjs.util.createDialog('carepanel', '<i class="fa fa-fire"></i> ' + i18n.t('care.details'), 'right:0;bottom:0;'));
        $('#btn_care').click(function () {
            $('#care_dialog').toggle();
        });
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        //current year, current month, current day
        // moment.js, wat een mooie javascript bibliotheek

        _obj.layerIncident = new OpenLayers.Layer.WMS(
                i18n.t('care.incidents'),
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
                i18n.t('care.coverage'),
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
        _obj.layerNorm.dbkjsParent = _obj;
        this.updateLayerIncident();
        _obj.layerIncident.events.register("loadstart", _obj.layerIncident, function () {
            dbkjs.util.loadingStart(_obj.layerIncident);
        });

        _obj.layerIncident.events.register("loadend", _obj.layerIncident, function () {
            dbkjs.util.loadingEnd(_obj.layerIncident);
        });
        _obj.layerNorm.events.register("loadstart", _obj.layerNorm, function () {
            dbkjs.util.loadingStart(_obj.layerNorm);
        });
        _obj.layerNorm.events.register("loadend", _obj.layerNorm, function () {
            dbkjs.util.loadingEnd(_obj.layerNorm);
        });
        dbkjs.map.addLayers([_obj.layerIncident, _obj.layerNorm]);

        //Care heeft zijn eigen panel:
        _obj.dialog = dbkjs.util.createDialog('care_dialog', '<i class="fa fa-fire"></i> ' + i18n.t('care.incidentsAndCoverage'));
        $('body').append(_obj.dialog);
        _obj.sel_care = $('<input id="sel_care" name="sel_care" type="text" class="form-control" placeholder="' +
                i18n.t('care.selectPeriod') + '">');
        $('.dialog').drags({handle: '.panel-heading'});

        //_obj.updateLayer(moment().format('YYYY-MM-DD'));
        var incidentSel = $('<div id="incidentSel" style="display:none;"></div>');
        var normSel = $('<div id="normSel" style="display:none;"></div>');
        var normSel_minuten = $('<input id="sel_care" name="normSel_minuten" type="text" class="form-control" placeholder="' +
                i18n.t('care.excesses') + '">');
        normSel.append(normSel_minuten);
        incidentSel.append('<h5>' + i18n.t('care.dateRange') + '</h5>');
        incidentSel.append(_obj.sel_care);
        var default_range = moment().startOf('week').format('YYYY-MM-DD') + '/' + moment().endOf('week').format('YYYY-MM-DD');
        _obj.sel_care.daterangepicker({
            format: 'YYYY-MM-DD',
            startDate: moment().startOf('week').format('YYYY-MM-DD'),
            endDate: moment().endOf('week').format('YYYY-MM-DD')
        },
        function (start, end) {
            _obj.updateLayerIncident(start.format('YYYY-MM-DD') + '/' + end.format('YYYY-MM-DD'));
        });
        _obj.sel_care.val(default_range);
        _obj.updateLayerIncident(default_range);
        incidentSel.append('<h5>' + i18n.t('care.priority') + '</h5>');
        incidentSel.append(dbkjs.util.createListGroup(
                [
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>' + i18n.t('care.prio1') + '</span>',
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>' + i18n.t('care.prio2') + '</span>',
                    '<input name="chk_prio" type="checkbox" checked="checked"/><span>' + i18n.t('care.prio3') + '</span>'
                ]
                ));
        //haal class1Sel op;
        //http://localhost/api/incidents/list/class/1
        $.getJSON('api/incidents/list/class/1').done(function (data) {
            if (data.length > 0) {
                var myselect = $('<select id="class1Selsel" class="form-control"></select>');
                myselect.append('<option selected>' + i18n.t('care.all') + '</option>')
                $.each(data, function (d_index, d_item) {
                    myselect.append('<option>' + d_item.name + '</option>')
                });
                incidentSel.append('<h5>' + i18n.t('care.class1') + '</h5>');
                incidentSel.append(myselect);
                myselect.on('change', function () {
                    //refresh!
                    dbkjs.modules.care.classification1 = this.value;
                    if (this.value !== i18n.t('care.all')) {
                        $.getJSON('api/incidents/list/class/2/' + this.value).done(function (data) {
                            if (data.length > 0) {
                                var myselect2;

                                if ($('#class2Selsel').length !== 0) {
                                    myselect2 = $('#class2Selsel')
                                            .find('option')
                                            .remove()
                                            .end();
                                } else {
                                    myselect2 = $('<select id="class2Selsel" class="form-control"></select>');
                                    incidentSel.append('<h5 id="class2Selselh">' + i18n.t('care.class2') + '</h5>');
                                    incidentSel.append(myselect2);
                                }
                                myselect2.append('<option selected>' + i18n.t('care.all') + '</option>');
                                $.each(data, function (d_index, d_item) {
                                    myselect2.append('<option>' + d_item.name + '</option>');
                                });

                                myselect2.on('change', function () {
                                    //refresh!
                                    dbkjs.modules.care.classification2 = this.value;
                                    if (this.value !== i18n.t('care.all')) {
                                        $.getJSON('api/incidents/list/class/3/' + this.value).done(function (data) {
                                            if (data.length > 0) {
                                                var myselect3;
                                                if ($('#class3Selsel').length !== 0) {
                                                    myselect3 = $('#class3Selsel')
                                                            .find('option')
                                                            .remove()
                                                            .end();
                                                } else {
                                                    myselect3 = $('<select id="class3Selsel" class="form-control"></select>');
                                                    incidentSel.append('<h5 id="class3Selselh">' + i18n.t('care.class3') + '</h5>');
                                                    incidentSel.append(myselect3);
                                                }
                                                myselect3.append('<option selected>' + i18n.t('care.all') + '</option>');
                                                $.each(data, function (d_index, d_item) {
                                                    myselect3.append('<option>' + d_item.c3 + '</option>');
                                                });
                                                myselect3.on('change', function () {
                                                    //refresh!
                                                    if (this.value !== i18n.t('care.all')) {
                                                        dbkjs.modules.care.classification3 = this.value;
                                                    } else {
                                                        dbkjs.modules.care.classification3 = "";
                                                    }
                                                    dbkjs.modules.care.refreshCQL();
                                                });
                                            }
                                        });
                                    } else {
                                        //destroy!
                                        $('#class3Selselh').remove();
                                        $('#class3Selsel').remove();
                                        dbkjs.modules.care.classification2 = "";
                                        dbkjs.modules.care.classification3 = "";
                                    }
                                    dbkjs.modules.care.refreshCQL();
                                });
                            }
                        });
                    } else {
                        //destroy!
                        $('#class2Selselh').remove();
                        $('#class2Selsel').remove();
                        dbkjs.modules.care.classification1 = "";
                        dbkjs.modules.care.classification2 = "";
                    }
                    dbkjs.modules.care.refreshCQL();
                });
            }
        });
        incidentSel.append(dbkjs.util.createListGroup(
                [
                    '<input name="chk_koppel" type="checkbox"/><span>' + i18n.t('care.combinedWithCoverage') + '</span>'
                ]
                ));
        var incidenten_button = $('<button class="btn btn-block btn_5px" type="button">' +
                i18n.t('care.incidentsOn') + '</button>');
        var dekkingsplan_button = $('<button class="btn btn-block btn_5px" type="button">' +
                i18n.t('care.coverageOn') + '</button>');
        if (_obj.layerIncident.getVisibility()) {
            incidentSel.show();
            incidenten_button.addClass('btn-primary').html(i18n.t('care.incidentsOff'));
        }
        if (_obj.layerNorm.getVisibility()) {
            normSel.show();
            dekkingsplan_button.addClass('btn-primary').html(i18n.t('care.coverageOff'));
        }

        $(incidenten_button).click(function () {
            incidentSel.toggle();
            if (_obj.layerIncident.getVisibility()) {
                incidenten_button.removeClass('btn-primary').html(i18n.t('care.incidentsOn'));
                _obj.layerIncident.setVisibility(false);
            } else {
                incidenten_button.addClass('btn-primary').html(i18n.t('care.incidentsOff'));
                _obj.layerIncident.setVisibility(true);
            }
        });
        $(dekkingsplan_button).click(function () {
            normSel.toggle();
            if (_obj.layerNorm.getVisibility()) {
                dekkingsplan_button.removeClass('btn-primary').html(i18n.t('care.coverageOn'));
                _obj.layerNorm.setVisibility(false);
            } else {
                dekkingsplan_button.addClass('btn-primary').html(i18n.t('care.coverageOff'));
                _obj.layerNorm.setVisibility(true);
            }
        });
        $('#care_dialog_b').append(incidenten_button);
        $('#care_dialog_b').append(incidentSel);
        $('#care_dialog_b').append(dekkingsplan_button);
        $('#care_dialog_b').append(normSel);
        $.each(dbkjs.options.organisation.care, function (care_k, care_v) {
            var btn = $('<button class="btn btn-block btn_5px" type="button">' + care_v.button + '</button>');
            $(btn).click(function () {
                window.open(care_v.url);
                return false;
            });
            $('#care_dialog_b').append(btn);
        });
        $('input[name="chk_koppel"]').click(function () {
            $.each($('input[name="chk_koppel"]'), function (chk_idx, chk) {
                if ($(chk).is(':checked')) {
                    _obj.layerIncident.mergeNewParams({typename: _obj.namespace + ":incidentscare", layers: _obj.namespace + ":incidentscare", styles: 'careincidenten'});
                } else {
                    _obj.layerIncident.mergeNewParams({typename: _obj.namespace + ":incidentsgebied", layers: _obj.namespace + ":incidentsgebied", styles: 'prio'});
                }
            });

        });
        $('input[name="chk_prio"]').click(function () {
            _obj.refreshCQL();
        });
    },
    refreshCQL: function () {
        var _obj = dbkjs.modules.care;
        var prioArr = [];
        $.each($('input[name="chk_prio"]'), function (chk_idx, chk) {
            if ($(chk).is(':checked')) {
                prioArr.push("'" + $(chk).next().text() + "'");
            }
        });
        var prioFilter = "priority IN (" + prioArr.join() + ")";

        //_obj.layerIncident.mergeNewParams
        var classArr = [];
        classArr.push(prioFilter);
        if (_obj.classification1 !== "") {
            classArr.push("classification1='" + _obj.classification1 + "'");
        }
        if (_obj.classification2 !== "") {
            classArr.push("classification2='" + _obj.classification2 + "'");
        }
        if (_obj.classification3 !== "") {
            classArr.push("classification3='" + _obj.classification3 + "'");
        }
        var out = classArr.join(' AND ');
        var cqlfilterfinal;
        cqlfilterfinal = out;
        _obj.layerIncident.mergeNewParams({'cql_filter': cqlfilterfinal});
    },
    getfeatureinfo: function (e) {
        if (this.layerIncident.getVisibility()) {
            this.getIncidentInfo(e);
        }
        if (this.layerNorm.getVisibility()) {
            this.getNormInfo(e);
        }
    },
    getNormInfo: function (e) {
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
    getIncidentInfo: function (e) {
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
    panelIncident: function (response) {
        var _obj = dbkjs.modules.care;
        var geojson_format = new OpenLayers.Format.GeoJSON();
        //todo: conflicted with the Array.prototype.where, 
        //removed that nasty function. Have to find another solution for that.
        var results = geojson_format.read(response.responseText);
        if (results.length > 0) {
            $('#carepanel_b').html('');
            dbkjs.util.changeDialogTitle(i18n.t('care.incidents'), '#carepanel');
            var ft_div = $('<div class="table-responsive"></div>');
            var ft_tbl = $('<table id="incidenten_export" class="table table-hover table-condensed"></table>');
            var feat;
            for (feat = 0; feat < results.length; feat++) {
                ft_tbl.append('<tr><td colspan="2">' + dbkjs.util.createPriority(
                        results[feat].attributes.incidentnr,
                        results[feat].attributes.locationdescription,
                        results[feat].attributes.priority
                        ) + '</td></tr>'
                        );
                ft_tbl.append('<tr><td colspan="2">' + dbkjs.util.createClassification(
                        results[feat].attributes.classification1,
                        results[feat].attributes.classification2,
                        results[feat].attributes.classification3
                        ) + '</td></tr>');
                var datumtijd = moment(results[feat].attributes.datetimereported);
                ft_tbl.append('<tr><td colspan="2">' + dbkjs.util.createAddress(
                        results[feat].attributes.addresscity,
                        results[feat].attributes.addressmunicipality,
                        results[feat].attributes.addressstreet,
                        results[feat].attributes.addresshousenr,
                        results[feat].attributes.addresshousenradd,
                        results[feat].attributes.addressname,
                        results[feat].attributes.addresszipcode
                        ).html() +
                        '</td></tr>');

                ft_tbl.append('<tr><td>Datum/tijd</td><td>' + datumtijd.format('YYYY-MM-DD HH:mm:ss') + '</td></tr>');
                if (!dbkjs.util.isJsonNull(results[feat].attributes.firestation)) {
                    ft_tbl.append('<tr><td>Post</td><td>' + results[feat].attributes.firestation + '</td></tr>');
                }
                if (results[feat].attributes.timespanintake !== 0) {
                    ft_tbl.append('<tr><td>Aannametijd multi</td><td>' + dbkjs.util.parseSeconds(moment.duration(results[feat].attributes.timespanintake, "seconds")) + '</td></tr>');
                }
                if (results[feat].attributes.timespanissued !== 0) {
                    ft_tbl.append('<tr><td>Aanname en uitgiftetijd BRW</td><td>' + dbkjs.util.parseSeconds(moment.duration(results[feat].attributes.timespanissued, "seconds")) + '</td></tr>');
                }
                if (results[feat].attributes.timespanprocessing !== 0) {
                    ft_tbl.append('<tr><td>Verwerkingstijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(results[feat].attributes.timespanprocessing, "seconds")) + '</td></tr>');
                }
                if (results[feat].attributes.timespandeparted !== 0) {
                    ft_tbl.append('<tr><td>Uitruktijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(results[feat].attributes.timespandeparted, "seconds")) + '</td></tr>');
                }

                if (results[feat].attributes.timespandrivetime !== 0) {
                    ft_tbl.append('<tr><td>Aanrijdtijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(results[feat].attributes.timespandrivetime, "seconds")) + '</td></tr>');
                }
                if (results[feat].attributes.timespanattended !== 0) {
                    ft_tbl.append('<tr><td>Opkomsttijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(results[feat].attributes.timespanattended, "seconds")) + '</td></tr>');
                }
                if (results[feat].attributes.timespanonscene !== 0) {
                    ft_tbl.append('<tr><td>Inzettijd</td><td>' + dbkjs.util.parseSeconds(moment.duration(results[feat].attributes.timespanonscene, "seconds")) + '</td></tr>');
                }
                if (!dbkjs.util.isJsonNull(results[feat].attributes.objecttype)) {
                    ft_tbl.append('<tr><td>Functie</td><td>' + results[feat].attributes.objecttype + '</td></tr>');
                }
                if (!dbkjs.util.isJsonNull(results[feat].attributes.objectyearconstructed)) {
                    ft_tbl.append('<tr><td>Bouwjaar</td><td>' + results[feat].attributes.objectyearconstructed + '</td></tr>');
                }
                if (!dbkjs.util.isJsonNull(results[feat].attributes.sit1name)) {
                    ft_tbl.append(dbkjs.util.createNorm(
                            results[feat].attributes.sit1name,
                            results[feat].attributes.sit1timespanarrivalfirstunit,
                            results[feat].attributes.sit1maxtimespanarrivalfirstunit
                            ));
                }
                if (!dbkjs.util.isJsonNull(results[feat].attributes.sit2name)) {
                    ft_tbl.append(dbkjs.util.createNorm(
                            results[feat].attributes.sit2name,
                            results[feat].attributes.sit2timespanarrivalfirstunit,
                            results[feat].attributes.sit2maxtimespanarrivalfirstunit
                            ));
                }
                if (!dbkjs.util.isJsonNull(results[feat].attributes.sit3name)) {
                    ft_tbl.append(dbkjs.util.createNorm(
                            results[feat].attributes.sit3name,
                            results[feat].attributes.sit3timespanarrivalfirstunit,
                            results[feat].attributes.sit3maxtimespanarrivalfirstunit
                            ));
                }
            }
            ft_div.append(ft_tbl);
            $('#carepanel_b').append(ft_div);
            $('#carepanel_f').html('');
            $('#carepanel').show();
            $(".export").on('click', function () {
                // CSV
                dbkjs.util.exportTableToCSV.apply(this, [$('#incidenten_export'), 'export.csv']);
                $('#carepanel').toggle(true);
            });
        }
    },
    panelNorm: function (response) {
        var _obj = dbkjs.modules.care;
        
        //verwerk de featureinformatie
        //g = new OpenLayers.Format.GML.v3();
        var geojson_format = new OpenLayers.Format.GeoJSON();
        var features = geojson_format.read(response.responseText);
        if (features.length > 0) {
            $('#carepanel_b').html('');
            dbkjs.util.changeDialogTitle(i18n.t('care.coverage'), '#carepanel');
            var ft_div = $('<div class="table-responsive"></div>');
            var ft_tbl = $('<table id="incidenten_export" class="table table-hover table-condensed"></table>');

            for (var feat = 0;feat < features.length; feat++) {
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
            $(".export").on('click', function () {
                // CSV
                dbkjs.util.exportTableToCSV.apply(this, [$('#dekkingsplan_export'), 'export.csv']);
                $('#carepanel').toggle(true);
            });
        }
    }
};
