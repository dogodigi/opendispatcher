/*!
 *  Copyright (c) 2015 Eddy Scheper (eddy.scheper@aris.nl)
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
 *  along with your copy of this software. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* global OpenLayers */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
/**
 * @memberof dbkjs
 * @namespace
 */
dbkjs.mapcontrols = {
  /**
   * Create the controls
   */
  createMapControls: function() {
    if (dbkjs.viewmode !== 'fullscreen') {
      dbkjs.mapcontrols.createDesktopMapControls();
    } else {
      dbkjs.mapcontrols.createFullscreenMapControls();
    }
  },
  createDesktopMapControls: function() {
    var mousePos = new OpenLayers.Control.MousePosition({
      numDigits: dbkjs.options.projection.coordinates.numDigits,
      div: OpenLayers.Util.getElement('coords')
    });
    dbkjs.map.addControl(mousePos);

    var attribution = new OpenLayers.Control.Attribution({
      div: OpenLayers.Util.getElement('attribution')
    });
    dbkjs.map.addControl(attribution);

    var scalebar = new OpenLayers.Control.Scale(OpenLayers.Util.getElement('scale'));
    dbkjs.map.addControl(scalebar);

    dbkjs.naviHis = new OpenLayers.Control.NavigationHistory();
    dbkjs.map.addControl(dbkjs.naviHis);
    dbkjs.naviHis.activate();

    dbkjs.overview = new OpenLayers.Control.OverviewMap({
      theme: null,
      div: document.getElementById('minimappanel_b'),
      size: new OpenLayers.Size(180, 180)
    });
    dbkjs.map.addControl(dbkjs.overview);
    dbkjs.map.addControl(new OpenLayers.Control.Zoom({
      zoomInId: "zoom_in",
      zoomOutId: "zoom_out"
    }));

    dbkjs.map.events.register("moveend", dbkjs.map, function() {
      // Clear print when active. It should not be available after move.
      if (dbkjs.modules.print.printbox) {
        dbkjs.modules.print.clear();
      }
      //check if the naviHis has any content
      if (dbkjs.naviHis.nextStack.length > 0) {
        //enable next button
        $('#zoom_next').removeClass('disabled');
      } else {
        $('#zoom_next').addClass('disabled');
      }
      if (dbkjs.naviHis.previousStack.length > 1) {
        //enable previous button
        $('#zoom_prev').removeClass('disabled');
      } else {
        $('#zoom_prev').addClass('disabled');
      }
    });
  },
  createFullscreenMapControls: function() {
    dbkjs.map.addControl(new OpenLayers.Control.TouchNavigation({
      dragPanOptions: {
        enableKinetic: false
      },
      autoActivate: true
    }));

    // XXX rename option to options.fullscreen.showZoomButtons
    if (dbkjs.options.showZoomButtons) {
      var zoomContainer = $("<div/>").css({
        "position": "absolute",
        "left": "20px",
        "bottom": "100px",
        "z-index": "3000"
      });
      zoomContainer.appendTo("#mapc1map1");
      $("#zoom_in").css({
        "display": "block",
        "font-size": "24px"
      }).removeClass("navbar-btn").appendTo(zoomContainer).show();
      $("#zoom_out").css({
        "display": "block",
        "font-size": "24px"
      }).removeClass("navbar-btn").appendTo(zoomContainer).show();
      dbkjs.map.addControl(new OpenLayers.Control.Zoom({
        zoomInId: "zoom_in",
        zoomOutId: "zoom_out"
      }));
    }
  }
};
