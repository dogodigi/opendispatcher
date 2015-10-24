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

/**
 * @class Feed
 * @memberof dbkjs
 * @extends dbkjs.Class
 */
dbkjs.Feed = dbkjs.Class({
  /**
   * @memberof dbkjs.Feed
   */
  events: null,
  /**
   * @memberof dbkjs.Feed
   */
  data: null,
  /**
   * @memberof dbkjs.Feed
   */
  projection: "EPSG:4326",
  /**
   * @memberof dbkjs.Feed
   */
  url: 'http://www.google.nl',
  /**
   * @memberof dbkjs.Feed
   */
  reload: 200000,
  /**
   * @memberof dbkjs.Feed
   */
  crossDomain: true,
  /**
   * @memberof dbkjs.Feed
   */
  dataType: 'xml',
  /**
   * @memberof dbkjs.Feed
   */
  error: false,
  /**
   * @memberof dbkjs.Feed
   */
  timeout: null,
  i: 0,
  /**
   * @memberof dbkjs.Feed
   */
  initialize: function(name, url, options, callback) {
    var _obj = this;
    this.options = dbkjs.util.extend({}, options);
    dbkjs.util.extend(this, options);
    this.name = name;
    this.url = url;
    this.callback = callback;
  },
  /**
   * @memberof dbkjs.Feed
   */
  start: function(milliseconds) {
    var _obj = this;
    milliseconds = milliseconds || _obj.reload;
    _obj.reload = milliseconds;
    _obj.load();
  },
  /**
   * @memberof dbkjs.Feed
   */
  stop: function() {
    var _obj = this;
    if (_obj.timeout) {
      clearTimeout(_obj.timeout);
    }
  },
  /**
   * @memberof dbkjs.Feed
   */
  triggerTimeout: function() {
    var _obj = this;
    this.timeout = setTimeout(function() {
      _obj.load();
    }, _obj.reload);
  },
  /**
   * @memberof dbkjs.Feed
   */
  load: function() {
    var _obj = this;
    if (_obj.timeout) {
      clearTimeout(_obj.timeout);
    }
    _obj.error = false;

    $.ajaxPrefilter(function(options) {
      if (options.crossDomain) {
        options.url = 'proxy/?q=' + encodeURIComponent(options.url + '?' + options.data.toString());
        options.crossDomain = false;
      }
    });
    $.ajax(this.url, {
        crossDomain: this.crossDomain,
        data: this.data,
        dataType: this.dataType
      }).done(function(response) {
        //check the datatype of the response. If it is xml, convert to JSON
        if (_obj.dataType === 'xml') {
          _obj.triggerTimeout();
          _obj.callback(_obj.name, JSON.parse(xml2json(response, " ")));
        } else if (_obj.dataType === 'json') {
          _obj.triggerTimeout();
          _obj.callback(_obj.name, response);
        }
      })
      .fail(function() {
        _obj.callback(_obj.name, {});
      });
  },
  CLASS_NAME: "dbkjs.Feed"
});
