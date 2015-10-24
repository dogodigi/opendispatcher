/*!
 *  Copyright (c) 2014 Matthijs Laan (matthijslaan@b3partners.nl)
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
 * @exports connectionmonitor
 * @todo Complete documentation.
 */
dbkjs.modules.connectionmonitor = {
  /**
   * @constant
   * @type dbkjs.Module.id
   * @default
   */
  id: "dbk.module.connectionmonitor",
  /**
   *
   */
  connected: null,
  /**
   *
   */
  debug: null,
  /**
   *
   */
  okTimer: null,
  /**
   *
   */
  connectionCheckTimer: null,
  /**
   *
   */
  register: function(options) {

    if (dbkjs.viewmode !== "fullscreen") {
      return;
    }

    this.debug = !!dbkjs.options.connectionmonitorDebug;

    this.connected = true;

    $(".main-button-group").append($("<div class=\"btn-group pull-left connection-btn-group\">" +
      "<a id=\"connection\" href=\"#\" title=\"Verbindingsstatus\" class=\"btn navbar-btn btn-default\">" +
      "<i id=\"connectionicon\" class=\"fa fa-signal\" style=\"color: green\"></i></a>"));

    var me = this;
    $("#connection").click(function() {
      if (!me.connected) {
        dbkjs.util.alert("Fout", "Geen verbinding", "alert-danger");
      } else {
        window.location.reload();
      }
    });

    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 10;

    OpenLayers.Util.onImageLoadError = function() {
      dbkjs.modules.connectionmonitor.onConnectionError();
    };

    me.connectionCheckTimer = setTimeout(function() {
      me.checkConnectivity();
    }, 5000);
  },
  /**
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
   */
  cancelConnectivityCheck: function() {
    if (this.connectionCheckTimer !== null) {
      clearTimeout(this.connectionCheckTimer);
      this.connectionCheckTimer = null;
    }
  },
  /**
   *
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
};
