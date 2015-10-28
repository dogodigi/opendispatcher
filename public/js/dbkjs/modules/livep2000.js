/*!
 *  Copyright (c) 2014 Matthijs Laan (matthijslaan@b3partners.nl)
 *
 *  This file is part of opendispatcher/safetymapDBK
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

/* global OpenLayers, Proj4js */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
/**
 * Grabbing information from the p2000 paging monitor.
 * Particular for the Netherlands
 *
 * The standard url for feeds is [http://feeds.livep2000.nl](http://feeds.livep2000.nl)
 * The feed can be accessed with a GET and can be complemented with the
 * parameters 'r' and 'd', like
 *
 *     ?r=1,2&d=2
 *
 * ** Parameter r:**
 *
 * | code |region|
 * |------|:----------|
 * |1     |Groningen |
 * |2     |Friesland|
 * |3     |Drenthe|
 * |4     |IJsselland|
 * |5     |Twente|
 * |6     |Noord en Oost Gelderland|
 * |7     |Gelderland Midden|
 * |8     |Gelderland Zuid|
 * |9     |Utrecht|
 * |10    |Noord Holland Noord|
 * |11    |Zaanstreek-Waterland|
 * |12    |Kennemerland|
 * |13    |Amsterdam-Amstelland|
 * |14    |Gooi en Vechtstreek|
 * |15    |Haaglanden|
 * |16    |Hollands Midden|
 * |17    |Rotterdam Rijnmond|
 * |18    |Zuid-Holland Zuid|
 * |19    |Zeeland|
 * |20    |Midden- en West-Brabant|
 * |21    |Brabant Noord|
 * |22    |Brabant Zuid en Oost|
 * |23    |Limburg Noord|
 * |24    |Limburg Zuid|
 * |25    |Flevoland|
 *
 *
 * ** Parameter d:**
 *
 * |code|discipline|
 * |--|:----------|
 * |1|Brandweer|
 * |2|Ambulance|
 * |3|Politie|
 * |4|KRNM|
 *
 * @memberof dbkjs.modules
 * @exports livep2000
 * @param {integer} r - region
 * @param {integer} d - discipline
 */
dbkjs.modules.livep2000 = {
  /**
   * @constant
   * @type dbkjs.Module.id
   * @default
   */
  id: "dbk.module.livep2000",
  popup: null,
  dataXml: null,
  updated: null,
  markerLayer: null,
  marker: null,
  /**
   * @method encode
   * @param {String} s
   */
  encode: function(s) {
    if (s) {
      return dbkjs.util.htmlEncode(s);
    }
    return null;
  },
  /**
   * @method encodeIfNotEmpty
   * @param {String} s
   */
  encodeIfNotEmpty: function(s) {
    return s === null ? "" : this.encode(s);
  },
  /**
   * @method register
   * @param {Object} options
   */
  register: function(options) {
    var me = this;

    this.createPopup();

    $('<a></a>')
      .attr({
        'id': 'btn_openlivep2000',
        'class': 'btn btn-default navbar-btn',
        'href': '#',
        'title': 'P2000'
      })
      .append('<i class="fa fa-fire"></i>')
      .click(function(e) {
        e.preventDefault();

        if (me.marker) {
          me.markerLayer.removeMarker(me.marker);
          $('#info_livep2000').hide();
        }
        me.popup.show();
      })
      .appendTo('#btngrp_3');

    $('<span></span>')
      .attr({
        'id': 'info_livep2000',
        'class': 'btn btn-default navbar-btn',
        'style': 'margin-right: 5px; display: none'
      })
      .click(function(e) {
        if (me.marker) {
          dbkjs.map.setCenter(me.marker.lonlat, dbkjs.options.zoom);
        }
      })
      .prependTo('#footer');

    this.markerLayer = new OpenLayers.Layer.Markers("P2000 Marker");
    dbkjs.map.addLayer(this.markerLayer);

    this.loadP2000();
  },
  /**
   * @method createPopup
   */
  createPopup: function() {
    this.popup = dbkjs.util.createModalPopup({
      title: 'P2000'
    });
    this.popup.getView().append($('<h4 id="p2000Update" style="padding-bottom: 15px">Gegegevens ophalen...</h4><div id="p2000"></div>'));
  },
  /**
   * @method loadP2000
   */
  loadP2000: function() {
    var me = this;
    me.error = false;
    var url = "http://feeds.livep2000.nl/?d=1";
    if (dbkjs.options.liveP2000Region !== null) {
      url += "&r=" + dbkjs.options.liveP2000Region;
    }
    $.ajax(dbkjs.basePath + 'proxy/', {
      dataType: "xml",
      data: {
        q: url
      },
      cache: false,
      ifModified: true,
      complete: function(jqXHR, textStatus) {
        try {
          if (textStatus === "success") {
            var lastModified = moment(jqXHR.getResponseHeader("Last-Modified"));
            me.updated = lastModified.isValid() ? lastModified : moment();

            me.dataXml = jqXHR.responseXML;

            me.updateWindow();
          } else if (textStatus !== "notmodified") {
            me.error = "Fout bij het ophalen van de informatie: " + jqXHR.statusText;
          }
        } catch (e) {
          if (console && console.log) {
            console.log("JS exception bij verwerken GMS info", e);
          }
        }

        window.setTimeout(function() {
          me.loadP2000();
        }, 60000);
      }
    });
  },
  /**
   * @method updateWindow
   */
  updateWindow: function() {
    var me = this;

    $("#p2000").empty();

    if (this.error) {
      $("#p2000Update").text(this.error);
      return;
    }

    var buildDate = moment($(this.dataXml).find('lastBuildDate').text());

    var header = $("<span>Gegevens van <a href=\"http://www.livep2000.nl\" target=\"_blank\">www.livep2000.nl</a> (laatst gewijzigd " + buildDate.fromNow() + "):</span>");
    $("#p2000Update").empty().append(header);

    $(this.dataXml).find('item').each(function() {

      var div = $("<div class=\"melding\"></div>");

      var lat = $(this).find('lat').text();
      var long = $(this).find('long').text();

      var titel = $(lat && long ? "<a/>" : "<div/>");
      titel.attr({
        class: "titel"
      });
      var regel = me.encode($(this).find('title').text());
      titel.append(regel);

      if (lat && long) {
        titel.on("click", function() {
          var p = new Proj4js.Point(long, lat);
          var t = Proj4js.transform(new Proj4js.Proj("WGS84"), new Proj4js.Proj("EPSG:28992"), p);
          lon = t.x;
          lat = t.y;
          var reprojected = new OpenLayers.LonLat(lon, lat);
          me.setMarker(reprojected);
          $('#info_livep2000').html("<i class=\"fa fa-fire\"></i>&nbsp;" + regel).show();
          dbkjs.map.setCenter(reprojected, dbkjs.options.zoom);
          me.popup.hide();
        });
      }
      div.append(titel);
      var pubDate = moment($(this).find('pubDate').text());
      div.append($("<div class=\"tijd\">" + pubDate.format("dddd, D-M-YYYY HH:mm:ss") + " (" + pubDate.fromNow() + ")</div>"));

      div.appendTo("#p2000");
    });
  },
  /**
   * @method setMarker
   * @param {Object} lonlat
   */
  setMarker: function(lonlat) {
    if (this.marker) {
      this.markerLayer.removeMarker(this.marker);
    }

    var size = new OpenLayers.Size(21, 25);
    var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
    this.marker = new OpenLayers.Marker(
      lonlat,
      new OpenLayers.Icon("images/marker-red.png", size, offset));
    this.markerLayer.addMarker(this.marker);
  }
};
