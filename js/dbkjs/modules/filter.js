var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.filter = {
    id: "filter",
    sel_district: null,
    selectie: {
        districten: [],
        gemeenten: []
    },
    register: function(options) {
        var _obj = dbkjs.modules.filter;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        $('#btngrp_3').append('<a id="btn_filter" class="btn btn-default navbar-btn" href="#" title="Filter activeren">' +
                '<i class="icon-filter"></i>' +
                '</a>');
        $('body').append(dbkjs.util.createModal('filter_dialog', '<i class="icon-filter"></i> Filter'));
        _obj.getDistricten();
        _obj.getGemeenten();
        $('#btn_filter').click(function() {
            $('#filter_dialog').modal('toggle');
        });

        var btn_filter_set = $('<button id="btn_filter_set" class="btn btn-block btn_5px" type="button">Activeren</button>');
        var btn_filter_reset = $('<button id="btn_filter_reset" class="btn btn-block btn_5px" type="button">Reset</button>');
        $('#filter_dialog_b').append(btn_filter_set);
        $('#filter_dialog_b').append(btn_filter_reset);
        $('#btn_filter_set').click(function() {
            _obj.selectie.districten = [];
            $("#sel_district option").each(function() {

                if (this.selected) {
                    _obj.selectie.districten.push(this.value);
                }
            });
            _obj.selectie.gemeenten = [];
            $("#sel_gemeente option").each(function() {

                if (this.selected) {
                    _obj.selectie.gemeenten.push(this.value);
                }
            });
            dbkjs.modules.care.updateSelectieIncident();
        });
        $('#btn_filter_reset').click(function() {
            _obj.selectie.districten = [];
            _obj.selectie.gemeenten = [];
            $("#sel_gemeente option").prop("selected", false);
            $("#sel_district option").prop("selected", false);
            dbkjs.modules.care.updateSelectieIncident();
        });

    },
    //        if (_obj.layerIncident.params.CQL_FILTER) {
    //            params.CQL_FILTER = _obj.layerIncident.params.CQL_FILTER;
    //            params.CQL_FILTER += ' AND ' + 'district_nr = 1';
    //        } else {
    //            params.CQL_FILTER = 'district_nr = 1';
    //        }
    getFilter: function() {
        var _obj = dbkjs.modules.filter;
        var result = '';
        if (_obj.selectie.gemeenten.length > 0) {
            result += " AND gem_naam IN ('" + _obj.selectie.gemeenten.join("','") + "') ";
        }
        if (_obj.selectie.districten.length > 0) {
            result += " AND district_naam IN ('" + _obj.selectie.districten.join("','") + "') ";
        }
        return result;
    },
    getDistricten: function() {
        var _obj = dbkjs.modules.filter;
        var params = {
            bbox: dbkjs.map.getExtent().toBBOX(0),
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.namespace + ":district_box",
            outputFormat: "application/json"
        };
        $.ajax({
            type: "GET",
            url: _obj.url + 'ows',
            data: params,
            dataType: "json",
            success: function(data) {
                var geojson_format = new OpenLayers.Format.GeoJSON();
                var districten = geojson_format.read(data);
                $('#filter_dialog_b').append('<h5>District(en)</h5>');
                _obj.sel_district = $('<select id="sel_district" multiple class="form-control"><select>');
                //loop through districts.
                //_obj.sel_district.append('<option>1</option>');
                $.each(districten, function(district_idx, district) {
                    _obj.sel_district.append('<option>' + district.attributes.naam + '</option>');
                });
                $('#filter_dialog_b').append(_obj.sel_district);
            },
            error: function() {
                return false;
            },
            complete: function() {
                return false;
            }
        });


    },
    getGemeenten: function() {
        var _obj = dbkjs.modules.filter;
        var params = {
            bbox: dbkjs.map.getExtent().toBBOX(0),
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.namespace + ":gemeente_box",
            outputFormat: "application/json"
        };
        $.ajax({
            type: "GET",
            url: _obj.url + 'ows',
            data: params,
            dataType: "json",
            success: function(data) {
                var geojson_format = new OpenLayers.Format.GeoJSON();
                var gemeenten = geojson_format.read(data);
                $('#filter_dialog_b').append('<h5>Gemeenten(en)</h5>');
                _obj.sel_gemeente = $('<select id="sel_gemeente" multiple class="form-control"><select>');
                //loop through districts.
                //_obj.sel_district.append('<option>1</option>');
                $.each(gemeenten, function(district_idx, gem) {
                    _obj.sel_gemeente.append('<option>' + gem.attributes.naam + '</option>');
                });
                $('#filter_dialog_b').append(_obj.sel_gemeente);
            },
            error: function() {
                return false;
            },
            complete: function() {
                return false;
            }
        });


    }

};
