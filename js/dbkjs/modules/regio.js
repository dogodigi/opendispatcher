var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.regio = {
    id: "dbkregio",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    features: [],
    url: "/zeeland/",
    namespace: "zeeland",
    register: function(options) {
        var _obj = dbkjs.modules.regio;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.get();
//        $('#btn-grp-search').before('<div id="regio_selectie" class="btn-group">' +
//                '<button id="geselecteerd_district" type="button" class="btn btn-default">Regio</button>' +
//                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
//                '<span class="caret"></span>' +
//                '</button>' +
//                '</div>' +
//                '<div id="district_selectie" class="btn-group" style="display:none;">' +
//                '<button id="geselecteerde_gemeente" type="button" class="btn btn-default"></button>' +
//                '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">' +
//                '<span class="caret"></span>' +
//                '</button>' +
//                '</div>');
    },
    get: function() {
        var _obj = dbkjs.modules.regio;
        var params = {
            bbox: dbkjs.map.getExtent().toBBOX(0),
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.namespace + ":regio_box",
            outputFormat: "application/json"
        };
        $.ajax({
            type: "GET",
            url: _obj.url + 'ows',
            data: params,
            dataType: "json",
            success: function(data) {
                var geojson_format = new OpenLayers.Format.GeoJSON();
                _obj.features = geojson_format.read(data);
                _obj.zoomExtent();
            },
            error: function() {
                return false;
            },
            complete: function() {
                return false;
            }
        });
    },
    zoomExtent: function() {
        var _obj = dbkjs.modules.regio;
        var bounds = _obj.features[0].geometry.getBounds().clone();
        for (var i = 1; i < _obj.features.length; i++) {
            bounds.extend(_obj.features[i].geometry.getBounds());
        }
        //dbkjs.map.maxExtent = bounds;
        dbkjs.map.zoomToExtent(bounds, false);
    }
};
