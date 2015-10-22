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
 * @module dbkjs.prototype
 * @class Class
 */
dbkjs.Util = dbkjs.Util || {};
dbkjs.Util.extend = function(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }

        /**
         * IE doesn't include the toString property when iterating over an object's
         * properties with the for(property in object) syntax.  Explicitly check if
         * the source has its own toString property.
         */

        /*
         * FF/Windows < 2.0.0.13 reports "Illegal operation on WrappedNative
         * prototype object" when calling hawOwnProperty if the source object
         * is an instance of window.Event.
         */

        var sourceIsEvt = typeof window.Event == "function" &&
          source instanceof window.Event;

        if (!sourceIsEvt &&
          source.hasOwnProperty && source.hasOwnProperty("toString")) {
            destination.toString = source.toString;
        }
    }
    return destination;
};

dbkjs.Class = function() {
    var len = arguments.length;
    var P = arguments[0];
    var F = arguments[len - 1];

    var C = typeof F.initialize === "function" ?
            F.initialize :
            function() {
                P.prototype.initialize.apply(this, arguments);
            };

    if (len > 1) {
        var newArgs = [C, P].concat(
                Array.prototype.slice.call(arguments).slice(1, len - 1), F);
        dbkjs.inherit.apply(null, newArgs);
    } else {
        C.prototype = F;
    }
    return C;
};

dbkjs.inherit = function(C, P) {
    var F = function() {
    };
    F.prototype = P.prototype;
    C.prototype = new F();
    var i, l, o;
    for (i = 2, l = arguments.length; i < l; i++) {
        o = arguments[i];
        if (typeof o === "function") {
            o = o.prototype;
        }
        dbkjs.Util.extend(C.prototype, o);
    }
};

dbkjs.util = dbkjs.util || {};
dbkjs.util.extend = function(destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (typeof(value) !== "undefined") {
                destination[property] = value;
            }
        }

        var sourceIsEvt = typeof window.Event === "function" &&
            source instanceof window.Event;

        if (!sourceIsEvt &&
            source.hasOwnProperty && source.hasOwnProperty("toString")) {
                destination.toString = source.toString;
        }
    }
    return destination;
};
