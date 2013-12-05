var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.Capabilities = dbkjs.Class({
    wmsCapabilitiesFormat: new OpenLayers.Format.WMSCapabilities(),
    url: 'gs2/custom_21/wms?',
    prefix: '',
    SERVICE: 'WMS',
    VERSION: '1.1.0',
    REQUEST: 'GetCapabilities',
    title: 'WMS lagen',
    onLayerLoadError: function() {
        /* Display error message, etc */
    },
    initialize: function(options){
        this.options = OpenLayers.Util.extend({}, options);
        OpenLayers.Util.extend(this, options);
        var _obj = this;
        OpenLayers.Request.GET({
            url: this.url,
            params: {
                SERVICE: this.SERVICE,
                VERSION: this.VERSION, // For example, '1.1.1'
                REQUEST: this.REQUEST
            },
            success: function(r) {
                var doc = r.responseXML;
                if (!doc || !doc.documentElement) {
                    doc = r.responseText;
                }
                var c = _obj.wmsCapabilitiesFormat.read(doc);
                if (!c || !c.capability) {
                    _obj.onLayerLoadError();
                    return;
                } else {
                    //construct a unique identifier
                    var myID = OpenLayers.Util.createUniqueID('overlay_tab');
                    //create a panel to hold the layers
                    $('#overlaypanel_ul').append('<li><a href="#' + myID + '" data-toggle="tab">' + _obj.title + '</a></li>');
                    $('#overlaypanel_div').append('<div class="tab-pane" id="' + myID + '">' +
                                    '<div id="' + myID + '_panel" class="panel-group"></div>' +
                                '</div>');
                    //loop through all the layers and make them available
                    $.each(c.capability.layers, function(lkey, lval) {
                        var myLayer = new dbkjs.Layer({
                            name: lval.title,
                            url: _obj.url,
                            map: dbkjs.map,
                            layerOptions: {layers: lval.name},
                            parent: '#' + myID + '_panel',
                            index: lkey
                        });
                    });
                    return;
                }
            },
            failure: function(r) {
                _obj.onLayerLoadError();
            }
        });
    }
});

