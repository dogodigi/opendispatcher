var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.updateFilter = function(id) {
    //Is er een DBK geselecteerd of is de id leeg?
    $.each(dbkjs.modules, function(mod_index, module) {
        if ($.inArray(mod_index, dbkjs.options.regio.modules) > -1) {
            if (module.updateFilter) {
                module.updateFilter(id);
            }
        }
    });
};
dbkjs.modules.search = {
    register: function() {
        var search_div = $('#btn-grp-search');
        var search_group = $('<div class="input-group navbar-btn"></div>');
        var search_pre = $('<span id="search-add-on" class="input-group-addon"><i class="icon-building"></i></span>');
        var search_input = $('<input id="search_input" name="search_input" type="text" class="form-control" placeholder="' + i18n.t("search.dbkplaceholder") + '">');
        var search_btn_grp = $(
                '<div class="input-group-btn pull-right">' +
                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' + i18n.t("search.search") + ' <span class="caret"></span></button>' +
                '<ul class="dropdown-menu pull-right">' +
                '<li><a href="#" id="s_dbk"><i class="icon-building"></i> ' + i18n.t("search.dbk") + '</a></li>' +
                '<li><a href="#" id="s_oms"><i class="icon-bell"></i> ' + i18n.t("search.oms") + '</a></li>' +
                '<li><a href="#" id="s_adres"><i class="icon-home"></i> ' + i18n.t("search.address") + '</a></li>' +
                '<li><a href="#" id="s_coord"><i class="icon-pushpin"></i> ' + i18n.t("search.coordinates") + '</a></li>' +
                '</ul>' +
                '</div>'
                );
        search_group.append(search_pre);
        search_group.append(search_input);
        search_group.append(search_btn_grp);
        search_div.append(search_group);
        this.activate();
        search_div.show();
    },
    activate: function() {
        $('#search_input').typeahead({
            name: 'address',
            remote: {
                url: 'nominatim?format=json&countrycodes=nl&addressdetails=1&q=%QUERY',
                filter: function(parsedResponse) {
                    var dataset = [];

                    for (i = 0; i < parsedResponse.length; i++) {
                        var pnt = new OpenLayers.Geometry.Point(
                                parsedResponse[i].lon,
                                parsedResponse[i].lat).transform(
                                new OpenLayers.Projection("EPSG:4326"),
                                dbkjs.map.getProjectionObject()
                                );
                        dataset.push({
                            value: parsedResponse[i].display_name,
                            id: parsedResponse[i].osm_id,
                            geometry: pnt
                        });
                    }
                    return dataset;
                }
            }
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            dbkjs.modules.updateFilter(datum.id);
            if (dbkjs.map.zoom < 13) {
                dbkjs.map.setCenter(datum.geometry.getBounds().getCenterLonLat(), 11);
            } else {
                dbkjs.map.setCenter(datum.geometry.getBounds().getCenterLonLat());
            }
        });
        $('#search_input').click(
                function() {
                    $(this).val('');
                }
        );
        $('div.btn-group ul.dropdown-menu li a').click(function(e) {
            $('#search_input').typeahead('destroy');
            $('#search_input').val('');
            var mdiv = $(this).parent().parent().parent();
            var mbtn = $('#search-add-on');
            var minp = mdiv.parent().find('input');
            var searchtype = $(this).text().trim();
            if (searchtype === i18n.t("search.address")) {
                mbtn.html('<i class="icon-home"></i>');
                minp.attr("placeholder", i18n.t("search.addressplaceholder"));
                if (dbkjs.modules.search) {
                    dbkjs.modules.search.activate();
                }
            } else if (searchtype === i18n.t("search.coordinates")) {
                mbtn.html('<i class="icon-pushpin"></i>');
                minp.attr("placeholder", i18n.t("search.coordplaceholder"));
                $('#search_input').change(function() {
                    var ruwe_input = $('#search_input').val();
                    var loc;
                    var coords = ruwe_input.split(',');
                    coords[0] = parseFloat(coords[0]);
                    coords[1] = parseFloat(coords[1]);
                    if (coords.length === 2) {
                        if (coords[0] > 2.0 && coords[0] < 8.0 && coords[1] > 50.0 && coords[0] < 54.0) { //wgs84
                            loc = new OpenLayers.LonLat(coords[0], coords[1]).transform(new OpenLayers.Projection("EPSG:4326"), dbkjs.map.getProjectionObject());
                            dbkjs.modules.updateFilter(0);
                            dbkjs.map.setCenter(loc, 11);
                        } else if (coords[0] > -14000.0 && coords[0] < 293100.0 && coords[1] > 293100.0 && coords[0] < 650000.0) { //rd
                            loc = new OpenLayers.LonLat(coords[0], coords[1]).transform(new OpenLayers.Projection("EPSG:28992"), dbkjs.map.getProjectionObject());
                            dbkjs.modules.updateFilter(0);
                            dbkjs.map.setCenter(loc, 11);
                        } else {
                            // @todo build function to handle map fault
                        }
                    }
                    return false;
                });
            } else if (searchtype === i18n.t("search.dbk")) {
                mbtn.html('<i class="icon-building"></i>');
                minp.attr("placeholder", i18n.t("search.dbkplaceholder"));
                dbkjs.modules.feature.search_dbk();
            } else if (searchtype === i18n.t("search.oms")) {
                mbtn.html('<i class="icon-bell"></i>');
                minp.attr("placeholder", i18n.t("search.omsplaceholder"));
                dbkjs.modules.feature.search_oms();
            }
            mdiv.removeClass('open');
            mdiv.removeClass('active');
            e.preventDefault();
            return false;
        });
    }
};
