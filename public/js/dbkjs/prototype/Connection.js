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
dbkjs.Capabilities = dbkjs.Class({
  /**
   * @memberof dbkjs.Connection
   * @event
   */
  onConnectionError: function() {
    this.connected = false;

    $("#connectionicon").attr("class", "fa fa-exclamation");
    $("#connectionicon").attr("style", "color: red");

    if (this.okTimer !== null) {
      clearTimeout(this.okTimer);
      this.okTimer = null;
    }
  },
  /**
   * @memberof dbkjs.Connection
   * @event
   */
  onConnectionOK: function() {
    if (this.connected) {
      return;
    }

    this.connected = true;

    var me = this;
    if (me.okTimer === null) {
      $("#connectionicon").attr("class", "fa fa-signal");
      $("#connectionicon").attr("style", "color: gray");
      me.okTimer = setTimeout(function() {
        $("#connectionicon").attr("style", "color: green");
        $("#connectionicon").attr("class", "fa fa-signal");
        clearTimeout(me.okTimer);
        me.okTimer = null;
      }, 8000);
    }
  },
  /**
   * Call when other module (gms or ealgps) does regular Ajax requests and
   * calls onConnectionError() or onConnectionOK() so this module does not
   * have to do it
   * @memberof dbkjs.Connection
   */
  cancelConnectivityCheck: function() {
    if (this.connectionCheckTimer !== null) {
      clearTimeout(this.connectionCheckTimer);
      this.connectionCheckTimer = null;
    }
  },
  /**
   * @memberof dbkjs.Connection
   */
  checkConnectivity: function() {
    var me = this;
    $.ajax("api/organisation.json", {
      dataType: "json",
      cache: false,
      ifModified: true,
      complete: function(jqXHR, textStatus) {
        if (textStatus === "success" || textStatus === "notmodified") {
          me.onConnectionOK();
        } else {
          me.onConnectionError();
        }

        me.connectionCheckTimer = setTimeout(function() {
          me.checkConnectivity();
        }, 5000);
      }
    });
  }
});
