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
    }
};
