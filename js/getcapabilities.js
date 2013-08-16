var wmsCapabilitiesFormat = new OpenLayers.Format.WMSCapabilities();
var onLayerLoadError = function() { /* Display error message, etc */ }

OpenLayers.Request.GET({
    url : 'http://safetymaps.nl/geoserver/bn_a/wms?',
    params : {
        SERVICE: 'WMS',
        VERSION: '1.1.0', // For example, '1.1.1'
        REQUEST: 'GetCapabilities'
    },
    success: function(r){

        var doc = r.responseXML;
        if (!doc || !doc.documentElement) {
            doc = r.responseText;
        }

        var c = wmsCapabilitiesFormat.read(doc);
        if (!c || !c.capability) {
            onLayerLoadError();
            return;
        }       

        // Here is result, do whatever you want with it
        console.log(c);

    },
    failure : function(r) {
        onLayerLoadError();
    }
});
