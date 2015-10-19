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

/* global OpenLayers, Proj4js */

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.modules = dbkjs.modules || {};
dbkjs.modules.messages = {
  id: "dbk.module.messages",

  layer: null,
  feeds: {},
  items: [],
  register: function(options) {
    var _obj = this;
    var stop = false;
    $('<a></a>')
      .attr({
        'id': 'btn_feed',
        'class': 'btn btn-default navbar-btn',
        'href': '#',
        'title': i18n.t('app.messages')
      })
      .append('<i class="fa fa-bell"></i>')
      .click(function(e) {
        e.preventDefault();
        if ($(this).hasClass('btn-warning')) {
          $(this).removeClass('btn-warning');
          stop = true;
        } else {
          $(this).addClass('btn-warning');
          stop = false;
        }

        $.each(_obj.feeds, function(index, feed) {
          // turn on
          if (!stop) {
            feed.start();
          } else {
            // or turn off
            feed.stop();
            _obj.items = _obj.purge(feed.name);
          }
        });
      })
      .appendTo('#btngrp_3');

    /**
     * Grabbing information from a rss, xml or json information source.
     * This example can be used to create derivatives.
     *
     * The standard url for feeds is http://feeds.livep2000.nl
     * The feed can be accessed with a GET and can be complemented with the
     * parameters 'r' and 'd', like ?r=1,2&d=2
     * @param r region
     *   available regions:
     *     1: Groningen                    2: Friesland
     *     3: Drenthe                      4: IJsselland
     *     5: Twente                       6: Noord en Oost Gelderland
     *     7: Gelderland Midden            8: Gelderland Zuid
     *     9: Utrecht                     10: Noord Holland Noord
     *    11: Zaanstreek-Waterland        12: Kennemerland
     *    13: Amsterdam-Amstelland        14: Gooi en Vechtstreek
     *    15: Haaglanden                  16: Hollands Midden
     *    17: Rotterdam Rijnmond          18: Zuid-Holland Zuid
     *    19: Zeeland                     20: Midden- en West-Brabant
     *    21: Brabant Noord               22: Brabant Zuid en Oost
     *    23: Limburg Noord               24: Limburg Zuid
     *    25: Flevoland
     *
     * @param d discipline
     *   available disciplines:
     *     1: Brandweer     2: Ambulance
     *     3: Politie       4: KRNM
     *
     */
    this.feeds.p2000 = new dbkjs.Feed('p2000', 'http://feeds.livep2000.nl/', {
      data: {
        d: 1, //Firebrigade
        r: 21 //Brabant Noord
      },
      dataType: 'xml'
    }, dbkjs.modules.messages.callback);

    this.feeds.traffic = new dbkjs.Feed('wegwerk', 'http://www.wegwerkmeldingen.nl/GetWegObjecten.php', {
      data: {
        layout: 5,
        regio: 7,
        alleenRegio: 1
      },
      reload: 20000,
      dataType: 'xml'
    }, dbkjs.modules.messages.callback);

    this.layer = new OpenLayers.Layer.Markers("messages");
    dbkjs.map.addLayer(this.layer);
  },
  popup: function(item) {
    var div = $('<div class="feed_' + item.type + ' alert"></div>');
    div.append('<b>' + item.title + '</b><br />');
    div.append('<p>' + item.description + '</p><br />');
    div.append('<p>' + item.time + '</p>');
    //todo, where to append? $(document.body).append(div);
    return item;
  },
  marker: function(item) {
    var symbol = item.symbol || {
      image: "images/other/marker-gray.png",
      height: 25,
      width: 21
    };
    var _obj = this;
    var size = new OpenLayers.Size(symbol.width, symbol.height);
    var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
    var marker = new OpenLayers.Marker(item.geometry, new OpenLayers.Icon(symbol.image, size, offset));
    _obj.layer.addMarker(marker);
    item.marker = marker;
    return item;
  },
  purge: function(type) {
    var _obj = this;
    var i;
    var finalArray = [];
    for (i = 0; i < dbkjs.modules.messages.items.length; i++) {
      var item = dbkjs.modules.messages.items[i];
      if (item.type === type) {
        if (item.marker) {
          _obj.layer.removeMarker(item.marker);
        }
        //dbkjs.modules.messages.items.splice(i);
        //i--;
      } else {
        finalArray.push(item);
      }
    }
    return finalArray;
  },
  callback: function(type, result) {
    var _obj = dbkjs.modules.messages;
    _obj.items = _obj.purge(type);
    if (type === 'p2000') {
      $.each(result.rss.channel, function(index, value) {
        var feedItem = {};
        if (value.item) {
          var itemDateTime = moment(value.item.pubDate);
          if (moment().diff(itemDateTime, 'hours') < 48) {
            feedItem.type = type;
            feedItem.time = itemDateTime.format("dddd, D-M-YYYY HH:mm:ss") + " (" + itemDateTime.fromNow() + ")";
            feedItem.title = value.item.title['#cdata'];
            feedItem.description = value.item.description['#cdata'];
            if (value.item['geo:lat'] && value.item['geo:long']) {
              var p = new Proj4js.Point(value.item['geo:long'], value.item['geo:lat']);
              var t = Proj4js.transform(new Proj4js.Proj("WGS84"), new Proj4js.Proj("EPSG:28992"), p);
              var lon = t.x;
              var lat = t.y;
              var reprojected = new OpenLayers.LonLat(lon, lat);
              feedItem.geometry = reprojected;
              feedItem = _obj.marker(feedItem);
            }
            feedItem = _obj.popup(feedItem);
            _obj.items.push(feedItem);
          }

        }
      });
    } else if (type === 'wegwerk') {
      $.each(result.objecten, function(index, value) {
        var feedItem = {};
        if (value.Werk) {
          var beginDateTime = moment(value.Werk.Begin);
          var eindDateTime = moment(value.Werk.Eind);
          var now = moment();
          if (now.isBefore(eindDateTime) && now.isAfter(beginDateTime) ||
            (now.isSame(beginDateTime) || now.isSame(eindDateTime))) {
            feedItem.type = type;
            feedItem.symbol = {
              image: 'images/other/roadwork.png',
              height: 25,
              width: 28
            };
            feedItem.time = decodeURIComponent(value.Werk.Wanneer); //eindDateTime.format("dddd, D-M-YYYY") + " (" + eindDateTime.fromNow() + ")";
            feedItem.title = decodeURIComponent(value.Werk.Titel);
            feedItem.description = '';

            if (value.Werk.x && value.Werk.y) {
              var p = new Proj4js.Point(value.Werk.x, value.Werk.y);
              var t = Proj4js.transform(new Proj4js.Proj("EPSG:900913"), new Proj4js.Proj("EPSG:28992"), p);
              var lon = t.x;
              var lat = t.y;
              var reprojected = new OpenLayers.LonLat(lon, lat);
              feedItem.geometry = reprojected;
              feedItem = _obj.marker(feedItem);
            }
            feedItem = _obj.popup(feedItem);
            _obj.items.push(feedItem);
          }

        }
      });
    }
  }
};
