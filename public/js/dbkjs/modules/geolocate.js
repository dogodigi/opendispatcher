/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
 *
 *  This file is part of opendispatcher/safetymapsDBK
 *
 *  opendispatcher is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  opendispatcher is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with opendispatcher. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global OpenLayers */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
/**
 * @memberof dbkjs.modules
 * @exports geolocate
 * @todo Complete documentation.
 */
dbkjs.modules.geolocate = {
  /**
   *
   */
  id: 'dbk.modules.geolocate',
  /**
   *
   */
  style: {
    strokeColor: '#CCCC00',
    fillColor: '#CCCC00',
    strokeWidth: 1,
    fillOpacity: 0.1
  },
  /**
   * @property {Object} layer - OpenLayers.Layer
   */
  layer: new OpenLayers.Layer.Vector('GPS location'),
  /**
   * @property {boolean} firstGeolocation - true or false
   */
  firstGeolocation: true,
  /**
   * @param {Object} feature - <OpenLayers.Feature>
   */
  pulsate: function(feature) {
    var _obj = dbkjs.modules.geolocate;
    var point = feature.geometry.getCentroid(),
      bounds = feature.geometry.getBounds(),
      radius = Math.abs((bounds.right - bounds.left) / 2),
      count = 0,
      grow = 'up';

    var resize = function() {
      if (count > 16) {
        clearInterval(window.resizeInterval);
      }
      var interval = radius * 0.03;
      var ratio = interval / radius;
      switch (count) {
        case 4:
        case 12:
          grow = 'down';
          break;
        case 8:
          grow = 'up';
          break;
      }
      if (grow !== 'up') {
        ratio = -Math.abs(ratio);
      }
      feature.geometry.resize(1 + ratio, point);
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
  /**
   * @method register
   */
  register: function() {
    var _obj = dbkjs.modules.geolocate;
    $('#btngrp_3').append('<a id="btn_geolocate" class="btn btn-default navbar-btn" href="#" title="' + i18n.t('map.zoomLocation') + '"><i class="fa fa-crosshairs"></i></a>');
    $('#btn_geolocate').click(function() {
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
    _obj.control.events.register("locationupdated", _obj.control, function(e) {
      _obj.layer.removeAllFeatures();
      var circle = new OpenLayers.Feature.Vector(
        OpenLayers.Geometry.Polygon.createRegularPolygon(
          new OpenLayers.Geometry.Point(e.point.x, e.point.y),
          e.position.coords.accuracy / 2,
          40,
          0
        ), {},
        _obj.style
      );
      _obj.layer.addFeatures([
        new OpenLayers.Feature.Vector(
          e.point, {}, {
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
