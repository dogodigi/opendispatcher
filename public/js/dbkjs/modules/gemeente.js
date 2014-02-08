var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.gemeente = {
    id: "dbkgemeente",
    /**
     * URL naar een statisch boringen bestand in gml formaat
     */
    features: [],
    url: "/geoserver/zeeland/ows?",
    namespace: "zeeland",
    register: function(options) {
        var _obj = dbkjs.modules.gemeente;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.get();
    },
    get: function() {
        var _obj = dbkjs.modules.gemeente;
        var params = {
            bbox: dbkjs.map.getExtent().toBBOX(0),
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.namespace + ":gemeente_box",
            outputFormat:"application/json"
        };
        $.ajax({
            type: "GET",
            url: _obj.url + 'ows',
            data: params,
            dataType: "json",
            success: function(data) {
                var geojson_format = new OpenLayers.Format.GeoJSON();
                _obj.features = geojson_format.read(data);
                _obj.ul = $('<ul id="gem_drop" class="dropdown-menu" role="menu"></ul>');
                _obj.bounds = _obj.features[0].geometry.getBounds().clone();
                var gem_li = $('<li><a href="#gem_0">' + _obj.features[0].attributes.naam + '</a></li>');
                gem_li.click(function() {
                    var n = parseInt($(this).children('a').first().attr('href').replace("#gem_", ""));
                    $('#geselecteerde_gemeente').html(_obj.features[n].attributes.naam);
                    var bounds = _obj.features[n].geometry.getBounds().clone();
                    dbkjs.map.zoomToExtent(bounds, false);
                });
                _obj.ul.append(gem_li);
                for (var i = 1; i < _obj.features.length; i++) {
                    _obj.bounds.extend(_obj.features[i].geometry.getBounds());
                    gem_li = $('<li><a href="#gem_' + i + '">' + _obj.features[i].attributes.naam + '</a></li>');
                    _obj.ul.append(gem_li);
                    gem_li.click(function() {
                        var n = parseInt($(this).children('a').first().attr('href').replace("#gem_", ""));
                        $('#geselecteerde_gemeente').html(_obj.features[n].attributes.naam);
                        var bounds = _obj.features[n].geometry.getBounds().clone();
                        dbkjs.map.zoomToExtent(bounds, false);
                    });
                }
                _obj.ul.append('<li class="divider"></li>');
                var regio_li = $('<li><a href="#district">'+ _obj.features[0].attributes.district + '</a></li>');
                _obj.ul.append(regio_li);
                regio_li.click(function() {
                    dbkjs.map.zoomToExtent(_obj.bounds, false);
                    $('#geselecteerde_gemeente').html(_obj.features[0].attributes.district);
                    _obj.ul = _obj.ul.detach();
                    $('#district_selectie').hide();
                    $('#regio_selectie').show();
                });
                $('#district_selectie').append(_obj.ul);
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
        var _obj = dbkjs.modules.gemeente;
        var bounds = _obj.features[0].geometry.getBounds().clone();
        for (var i = 1; i < _obj.features.length; i++) {
            bounds.extend(_obj.features[i].geometry.getBounds());
        }
        dbkjs.map.zoomToExtent(bounds, false);
    }
};
