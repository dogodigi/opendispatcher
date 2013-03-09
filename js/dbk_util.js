function convertOlToJstsGeom(olGeom) {
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
}

function convertJstsToOlGeom(jstsGeom) {
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
}

function getFeaturesForBuffer(vLayer, buffer) {
    var result = [];
    var i;
    for (i = 0; i<vLayer.features.length; i++) {
        var feat = vLayer.features[i];
        var jstsGeom = convertOlToJstsGeom(feat.geometry);
        if (buffer.intersects(jstsGeom)) {
            if (typeof(feat.cluster) !== "undefined") {
            	var j;
                for (j = 0; j<feat.cluster.length; j++) {
                    result.push(feat.cluster[j]);
                }
             } else {
                 result.push(feat);
             }
        }
    }
    return result;
}

function getFeaturesForLine(vLayer, jstsLine, bufdist) {
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
}

function touchEnabled(){
    if ("ontouchstart" in document.documentElement) {
        return true;
    } else {
        return false;
    } 
}
