/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 * 
 *  This file is part of safetymapDBK
 *  
 *  safetymapDBK is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  safetymapDBK is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with safetymapDBK. If not, see <http://www.gnu.org/licenses/>.
 *
 */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.district = {
    id: "dbk.modules.district",
    features: [],
    url: "/geoserver/ows?",
    namespace: "brabantnoord",
    register: function(options) {
        var _obj = dbkjs.modules.district;
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        _obj.get();
    },
    get: function() {
        var _obj = dbkjs.modules.district;
        var params = {
            bbox: dbkjs.map.getExtent().toBBOX(0),
            service: "WFS",
            version: "1.0.0",
            request: "GetFeature",
            typename: _obj.namespace + ":district_box",
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
                _obj.ul = $('<ul id="district_drop" class="dropdown-menu" role="menu"></ul>');
                _obj.bounds = _obj.features[0].geometry.getBounds().clone();
                var district_li = $('<li><a href="#district_0">' + _obj.features[0].attributes.naam + '</a></li>');
                district_li.click(function() {
                    var n = parseInt($(this).children('a').first().attr('href').replace("#district_", ""));
                    $('#geselecteerd_district').html(_obj.features[n].attributes.naam);
                    var bounds = _obj.features[n].geometry.getBounds().clone();
                    dbkjs.map.zoomToExtent(bounds, false);
                    $('#regio_selectie').hide();
                    $('#district_selectie').show();
                });
                _obj.ul.append(district_li);
                for (var i = 1; i < _obj.features.length; i++) {
                    _obj.bounds.extend(_obj.features[i].geometry.getBounds());
                    district_li = $('<li><a href="#district_' + i + '">' + _obj.features[i].attributes.naam + '</a></li>');
                    _obj.ul.append(district_li);
                    district_li.click(function() {
                        var n = parseInt($(this).children('a').first().attr('href').replace("#district_", ""));
                        $('#geselecteerd_district').html(_obj.features[n].attributes.naam);
                        var bounds = _obj.features[n].geometry.getBounds().clone();
                        dbkjs.map.zoomToExtent(bounds, false);
                    });
                }
                _obj.ul.append('<li class="divider"></li>');
                var regio_li = $('<li><a href="#regio">Regio</a></li>');
                _obj.ul.append(regio_li);
                regio_li.click(function(){
                   dbkjs.map.zoomToExtent(_obj.bounds, false); 
                   $('#geselecteerd_district').html('Regio');
                });
                $('#regio_selectie').append(dbkjs.modules.district.ul);
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
        var _obj = dbkjs.modules.district;
        var bounds = _obj.features[0].geometry.getBounds().clone();
        for (var i = 1; i < _obj.features.length; i++) {
            bounds.extend(_obj.features[i].geometry.getBounds());
        }
        dbkjs.map.zoomToExtent(bounds, false);
    }
};
