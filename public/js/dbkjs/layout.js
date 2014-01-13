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
    if (dbkjs.modules.regio) {
        dbkjs.modules.regio.zoomExtent();
    } else {
        dbkjs.map.zoomToMaxExtent();
    }
});

