var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.getCapabilities = {
    wmsCapabilitiesFormat: new OpenLayers.Format.WMSCapabilities(),
    onLayerLoadError: function() {
        /* Display error message, etc */
    },
    get: function() {
        OpenLayers.Request.GET({
            url: 'http://safetymaps.nl/geoserver/bn_a/wms?',
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
                var c = wmsCapabilitiesFormat.read(doc);
                if (!c || !c.capability) {
                    dbkjs.modules.getcapabilities.onLayerLoadError();
                    return;
                }

                // Here is result, do whatever you want with it
                // @TODO do something with the result!
                // console.log(c);
            },
            failure: function(r) {
                dbkjs.modules.getcapabilities.onLayerLoadError();
            }
        });
    }
};
