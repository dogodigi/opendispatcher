
dbkjs.mapcontrols.createMapControls = function() {
    dbkjs.map.addControl(new OpenLayers.Control.TouchNavigation({
        dragPanOptions: {
            enableKinetic: false
        },
        autoActivate: true
    }));

    if(dbkjs.options.showZoomButtons) {
        $("#zoom_in").show();
        $("#zoom_out").show();
        dbkjs.map.addControl(new OpenLayers.Control.Zoom({
                zoomInId: "zoom_in",
                zoomOutId: "zoom_out"
            })
        );
    }
};

dbkjs.mapcontrols.registerMapEvents = function() {
};
