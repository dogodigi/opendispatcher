var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.search = {
    search: function() {
        $('#search_input').typeahead({
            name: 'address',
            remote: {
                url: 'nominatim?format=json&countrycodes=nl&addressdetails=1&q=%QUERY',
                filter: function(parsedResponse) {
                    var dataset = [];

                    for (i = 0; i < parsedResponse.length; i++) {
                        var pnt = new OpenLayers.Geometry.Point(parsedResponse[i].lon, parsedResponse[i].lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
                        dataset.push({
                            value: parsedResponse[i].display_name,
                            id: parsedResponse[i].osm_id,
                            geometry: pnt
                        });
                    }
                    console.log(dataset);
                    return dataset;
                }
            }
        });
        $('#search_input').bind('typeahead:selected', function(obj, datum) {
            //console.log(obj);
            //console.log(datum);
            preparatie.updateFilter(datum.id);
            preventie.updateFilter(datum.id);
            gevaren.updateFilter(datum.id);
            dbkobject.updateFilter(datum.id);
            if (map.zoom < 13) {
                map.setCenter(datum.geometry.getBounds().getCenterLonLat(), 11);
            } else {
                map.setCenter(datum.geometry.getBounds().getCenterLonLat());
            }
        });
    }
};
