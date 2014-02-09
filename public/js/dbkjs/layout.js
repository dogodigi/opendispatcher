/**
 * 
 * javascript to control layout and layout events
 * 
 * This module depends on dbkjs, jQuery and OpenLayers
 * 
 */
$('#zoom_prev').click(function() {
    dbkjs.naviHis.previousTrigger();
});
$('#zoom_next').click(function() {
    dbkjs.naviHis.nextTrigger();
});

$('#zoom_extent').click(function() {
    if (dbkjs.options.organisation.modules.regio) {
        dbkjs.modules.regio.zoomExtent();
    } else {
        if (dbkjs.options.organisation.area.geometry.type === "Point") {
                dbkjs.map.setCenter(
                        new OpenLayers.LonLat(
                                data.organisation.area.geometry.coordinates[0],
                                data.organisation.area.geometry.coordinates[1]
                                ).transform(
                        new OpenLayers.Projection(dbkjs.options.projection.code),
                        dbkjs.map.getProjectionObject()
                        ),
                        dbkjs.options.organisation.area.zoom
                        );
            } else if (dbkjs.options.organisation.area.geometry.type === "Polygon"){
                var areaGeometry = new OpenLayers.Format.GeoJSON().read(dbkjs.options.organisation.area.geometry, "Geometry");
                dbkjs.map.zoomToExtent(areaGeometry.getBounds());
            }
    }
});

