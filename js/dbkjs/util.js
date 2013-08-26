var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.util = {
    /**
     * script voor updaten zichtbaarheid van overlays 
     * @param {<OpenLayers.Layer>} obj
     */
    toggleOverlay: function(obj) {
        var layers = dbkjs.map.getLayersByName(obj.name);
        if (layers.length === 1) {
            if (obj.checked === true) {
                layers[0].setVisibility(true);
            } else {
                layers[0].setVisibility(false);
            }
        } else {
            alert('layer niet gevonden (of meer dan 1)');
        }
    },
    onClick: function(e) {
        $('#infopanel_b').html('');
        $('#infopanel_f').html('');
        if (dbkjs.modules) {
            $.each(dbkjs.modules, function(mod_index, module) {
                if (typeof(module.layer) !== "undefined" && module.layer.visibility) {
                    // Controleer of het een van de dbk layers is waar op is geklikt.
                    if (dbkjs.protocol) { 
                        if(dbkjs.protocol.imdbk21) {
                            if ($.inArray(module.id, ["dbko", "dbkf", "dbkgev", "dbkprep", "dbkprev"]) !== -1) {
                                dbkjs.protocol.imdbk21.process(dbkjs.options.dbk);
                            } else {
                                if (typeof(module.getfeatureinfo) !== "undefined") {
                                    module.getfeatureinfo(e);
                                }
                            }
                        }
                    } else {
                        if (typeof(module.getfeatureinfo) !== "undefined") {
                            module.getfeatureinfo(e);
                        }
                    }
                }
            });
        }
    },
    isJsonNull: function(val) {
        if (val === "null" || val === null || val === "" || typeof(val) === "undefined") {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 
     * @param {String} variable
     * @param {String} defaultvalue
     * @returns {String} the value for the given queryparameter
     */
    getQueryVariable: function(variable, defaultvalue) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        var returnval = defaultvalue;
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) === variable) {
                returnval = decodeURIComponent(pair[1]);
            }
        }
        return returnval;
    },
    convertOlToJstsGeom: function(olGeom) {
        var result = null;
        if (typeof olGeom !== 'undefined') {
            var jstsConverter = new jsts.io.WKTReader();
            //var olConverter = new OpenLayers.Format.WKT();
            //var wktGeom = olConverter.write(olGeom);
            var wktGeom = olGeom.toString();
            var jstsGeom = jstsConverter.read(wktGeom);
            if (jstsGeom !== null) {
                result = jstsGeom;
            }
        }
        return result;
    },
    convertJstsToOlGeom: function(jstsGeom) {
        var result = null;
        if (typeof jstsGeom !== 'undefined') {
            var jstsConverter = new jsts.io.WKTWriter();
            var olConverter = new OpenLayers.Format.WKT();
            var wktGeom = jstsConverter.write(jstsGeom);
            //olGeom.toString();
            var olGeom = olConverter.read(wktGeom);
            if (olGeom !== null) {
                result = olGeom;
            }
        }
        return result;
    },
    getFeaturesForBuffer: function(vLayer, buffer) {
        var result = [];
        var i;
        for (i = 0; i < vLayer.features.length; i++) {
            var feat = vLayer.features[i];
            var jstsGeom = convertOlToJstsGeom(feat.geometry);
            if (buffer.intersects(jstsGeom)) {
                if (typeof(feat.cluster) !== "undefined") {
                    var j;
                    for (j = 0; j < feat.cluster.length; j++) {
                        result.push(feat.cluster[j]);
                    }
                } else {
                    result.push(feat);
                }
            }
        }
        return result;
    },
    getFeaturesForLine: function(vLayer, jstsLine, bufdist) {
        var result = new Array();
        var i;
        for (i = 0; i < vLayer.features.length; i++) {
            var feat = vLayer.features[i];
            var jstsGeom = convertOlToJstsGeom(feat.geometry);
            if (jstsLine.distance(jstsGeom) < bufdist) {
                if (typeof(feat.cluster) !== "undefined") {
                    var j;
                    for (j = 0; j < feat.cluster.length; j++) {
                        result.push(feat.cluster[j]);
                    }
                } else {
                    result.push(feat);
                }
            }
        }
        return result;
    },
    touchEnabled: function() {
        if ("ontouchstart" in document.documentElement) {
            return true;
        } else {
            return false;
        }
    }
};