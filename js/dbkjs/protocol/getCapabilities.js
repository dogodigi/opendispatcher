var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.protocol = dbkjs.protocol || {};
dbkjs.protocol.getCapabilities = {
    wmsCapabilitiesFormat: new OpenLayers.Format.WMSCapabilities(),
    onLayerLoadError: function() {
        /* Display error message, etc */
    },
    get: function() {
        OpenLayers.Request.GET({
            url: 'gs2/custom_21/wms?',
            params: {
                SERVICE: 'WMS',
                VERSION: '1.1.0', // For example, '1.1.1'
                REQUEST: 'GetCapabilities'
            },
            success: function(r) {
                var doc = r.responseXML;
                if (!doc || !doc.documentElement) {
                    doc = r.responseText;
                }
                var c = dbkjs.protocol.getCapabilities.wmsCapabilitiesFormat.read(doc);
                if (!c || !c.capability) {
                    dbkjs.protocol.getCapabilities.onLayerLoadError();
                    return;
                }
//                var layer = format.createLayer(capabilities, {
//                    layer: "medford:buildings",
//                    matrixSet: "EPSG:900913",
//                    format: "image/png",
//                    opacity: 0.7,
//                    isBaseLayer: false
//                });
//                map.addLayer(layer);
                // Here is result, do whatever you want with it
                // @TODO do something with the result!
            },
            failure: function(r) {
                dbkjs.protocol.getCapabilities.onLayerLoadError();
            }
        });
    }
};
