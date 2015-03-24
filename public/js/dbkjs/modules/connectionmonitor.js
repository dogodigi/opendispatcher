/*!
 *  Copyright (c) 2014 B3Partners (info@b3partners.nl)
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
dbkjs.modules.connectionmonitor = {
    id: "dbk.module.connectionmonitor",
    connected: null,
    debug: null,
    okTimer: null,
    register: function(options) {
        this.debug = !!dbkjs.options.connectionmonitorDebug;

        this.connected = true;

        $(".main-button-group").append($("<div class=\"btn-group pull-left connection-btn-group\">" +
            "<a id=\"connection\" href=\"#\" title=\"Verbindingsstatus\" class=\"btn navbar-btn btn-default\">" +
            "<i id=\"connectionicon\" class=\"icon-signal\" style=\"color: green\"></i></a>"));

        var me = this;
        $("#connection").click(function() {
            if(!me.connected) {
                dbkjs.util.alert("Fout", "Geen verbinding", "alert-danger");
            } else {
                window.location.reload();
            }
        });

        OpenLayers.IMAGE_RELOAD_ATTEMPTS = 10;

        OpenLayers.Util.onImageLoadError = function() {
            dbkjs.modules.connectionmonitor.onConnectionError();
        };
    },
    onConnectionError: function() {
        this.connected = false;

        $("#connectionicon").attr("class", "icon-exclamation-sign");
        $("#connectionicon").attr("style", "color: red");
    },
    onConnectionOK: function() {
        if(this.connected) {
            return;
        }

        this.connected = true;

        var me = this;
        if(me.okTimer === null) {
            $("#connectionicon").attr("class", "icon-signal");
            $("#connectionicon").attr("style", "color: gray");
            me.okTimer = setTimeout(function() {
                $("#connectionicon").attr("style", "color: green");
                $("#connectionicon").attr("class", "icon-signal");
                clearTimeout(me.okTimer);
                me.okTimer = null;
            }, 8000);
        }
    }
};

