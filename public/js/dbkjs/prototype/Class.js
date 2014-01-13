var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
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
    C.prototype = new F;
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

        var sourceIsEvt = typeof window.Event === "function"
                && source instanceof window.Event;

        if (!sourceIsEvt
                && source.hasOwnProperty && source.hasOwnProperty("toString")) {
            destination.toString = source.toString;
        }
    }
    return destination;
};
