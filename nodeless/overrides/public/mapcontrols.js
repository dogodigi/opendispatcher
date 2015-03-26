
dbkjs.mapcontrols.createMapControls = function() {
    dbkjs.map.addControl(new OpenLayers.Control.TouchNavigation({
        dragPanOptions: {
            enableKinetic: false
        },
        autoActivate: true
    }));
};

dbkjs.mapcontrols.registerMapEvents = function() {
};
