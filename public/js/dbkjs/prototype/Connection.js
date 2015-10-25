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

var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;

/**
 * @class Connection
 * @memberof dbkjs
 * @extends dbkjs.Class
 */
dbkjs.Connection = dbkjs.Class({
  url: null,
  method: 'get',
  cache: false,
  data: {},
  dataType: 'json',
  timer: null,
  ifModified: true,
  callback: null,
  /**
   * @memberof dbkjs.Connection
   */
  initialize: function(url, options, callback) {
    var _obj = this;
    this.options = dbkjs.util.extend({}, options);
    dbkjs.util.extend(this, options);
    this.url = url;
    this.callback = callback;
  },
  /**
   * Call when other module (gms or ealgps) does regular Ajax requests and
   * calls onConnectionError() or onConnectionOK() so this module does not
   * have to do it
   * @memberof dbkjs.Connection
   */
  stop: function() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },
  /**
   * Starts a timer that will poll a connection to see if it is available
   * @memberof dbkjs.Connection
   */
  start: function() {
    var _obj = this;
    $.ajax(_obj.url, {
        method: _obj.method,
        dataType: _obj.dataType,
        data: _obj.data,
        cache: _obj.cache,
        ifModified: _obj.ifModified
      })
      .done(function() {
        _obj.available = true;
      })
      .fail(function() {
        _obj.available = false;
      })
      .always(function() {
        _obj.timer = setTimeout(function() {
          _obj.start();
        }, 5000);
        _obj.callback(_obj.available);
      });
  }
});
