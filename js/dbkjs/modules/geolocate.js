var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};

dbkjs.modules.geolocate = {
    style: {
        strokeColor: '#CCCC00',
        fillColor: '#CCCC00',
        strokeWidth: 1,
        fillOpacity: 0.1
    },
    layer: new OpenLayers.Layer.Vector('GPS location'),
    firstGeolocation: true,
    
    /**
     * 
     * @param {<OpenLayers.Feature>} feature
     */
    pulsate: function(feature) {
        var _obj = dbkjs.modules.geolocate;
        var point = feature.geometry.getCentroid(),
            bounds = feature.geometry.getBounds(),
            radius = Math.abs((bounds.right - bounds.left)/2),
            count = 0,
            grow = 'up';

        var resize = function(){
            if (count>16) {
                clearInterval(window.resizeInterval);
            }
            var interval = radius * 0.03;
            var ratio = interval/radius;
            switch(count) {
                case 4:
                case 12:
                    grow = 'down'; break;
                case 8:
                    grow = 'up'; break;
            }
            if (grow!=='up') {
                ratio = - Math.abs(ratio);
            }
            feature.geometry.resize(1+ratio, point);
            _obj.layer.drawFeature(feature);
            count++;
        };
        window.resizeInterval = window.setInterval(resize, 50, point, radius);
    },

    control: new OpenLayers.Control.Geolocate({
        bind: true,
        geolocationOptions: {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 7000
        }
    }),
    register: function(){
        var _obj = dbkjs.modules.geolocate;
        $('#btngrp_3').append('<a id="btn_geolocate" class="btn btn-default navbar-btn" href="#"><i class="icon-screenshot"></i></a>');
        $('#btn_geolocate').click(function(){
            if ($(this).hasClass('active')) {
                _obj.layer.removeAllFeatures();
                _obj.control.deactivate();
                $(this).removeClass('active');
            } else {
                $(this).addClass('active');
                _obj.control.activate();
            }
        });
        dbkjs.map.addControl(_obj.control);
        dbkjs.map.addLayers([_obj.layer]);
        _obj.control.events.register("locationupdated",_obj.control,function(e) {
            _obj.layer.removeAllFeatures();
            var circle = new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy/2,
                    40,
                    0
                ),
                {},
                _obj.style
            );
            _obj.layer.addFeatures([
                new OpenLayers.Feature.Vector(
                    e.point,
                    {},
                    {
                        graphicName: 'circle',
                        fillColor: '#CCCC00',
                        strokeColor: '#CCCC00',
                        strokeWidth: 1,
                        fillOpacity: 0.3,
                        pointRadius: 10
                    }
                ),
                circle
            ]);
            if (dbkjs.modules.geolocate.firstGeolocation) {
                dbkjs.map.zoomToExtent(_obj.layer.getDataExtent());
                _obj.pulsate(circle);
                _obj.firstGeolocation = false;
                _obj.bind = true;
            }
        });
    }
};