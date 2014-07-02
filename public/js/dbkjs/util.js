/*!
 *  Copyright (c) 2014 Milo van der Linden (milo@dogodigi.net)
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
$.browser = {};
$.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit    /.test(navigator.userAgent.toLowerCase());
$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
$.browser.device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
dbkjs.argParser = 
    OpenLayers.Class(OpenLayers.Control.ArgParser, {
        setMap: function(map) {
            OpenLayers.Control.prototype.setMap.apply(this, arguments);

            //make sure we dont already have an arg parser attached
            for(var i=0, len=this.map.controls.length; i<len; i++) {
                var control = this.map.controls[i];
                if ( (control !== this) &&
                     (control.CLASS_NAME === "OpenLayers.Control.ArgParser") ) {

                    // If a second argparser is added to the map, then we 
                    // override the displayProjection to be the one added to the
                    // map. 
                    if (control.displayProjection !== this.displayProjection) {
                        this.displayProjection = control.displayProjection;
                    }    

                    break;
                }
            }
            if (i === this.map.controls.length) {

                var args = this.getParameters();
                // Be careful to set layer first, to not trigger unnecessary layer loads
                if (args.b) {
                    // when we add a new layer, set its visibility 
                    this.map.events.register('addlayer', this, 
                                             this.configureLayers);
                    this.configureLayers();
                }
                if (args.lat && args.lon) {
                    this.center = new OpenLayers.LonLat(parseFloat(args.lon),
                                                        parseFloat(args.lat));
                    if (args.zoom) {
                        this.zoom = parseFloat(args.zoom);
                    }

                    // when we add a new baselayer to see when we can set the center
                    this.map.events.register('changebaselayer', this, 
                                             this.setCenter);
                    this.setCenter();
                }
            }
        },
        loadLayers: function() {
            //console.log("loadLayers");
            var args = this.getParameters();
            //console.log(args);
            if(!dbkjs.disableloadlayer){
                if(args.ly && args.b) {
                    for(var i=0, len=this.map.layers.length; i<len; i++) {
                        if (!this.map.layers[i].isBaseLayer && 
                                $.inArray(this.map.layers[i].metadata.pl, args.ly) !== -1) {
                            this.map.layers[i].setVisibility(true);
                        } else if (!this.map.layers[i].isBaseLayer && 
                                !dbkjs.util.isJsonNull(this.map.layers[i].metadata.pl)) {
                            this.map.layers[i].setVisibility(false);
                        }
                    }                
                }
                if(args[i18n.t('app.queryDBK')] && dbkjs.modules.feature){
                    dbkjs.options.dbk = args[i18n.t('app.queryDBK')];
                    var feature = dbkjs.modules.feature.getActive();
                    if(feature){
                        dbkjs.protocol.jsonDBK.process(feature);
                        if(!args.lat && !args.lon && !args.zoom){
                            dbkjs.modules.feature.zoomToFeature(feature);
                        }
                    }
                    //console.log('Got dbk ' + args[i18n.t('app.queryDBK')] + ', what now?');
                }
            }
        },    
        configureLayers: function() {
            var args = this.getParameters();
            if(args.ly && args.b){
                for(var i=0, len=this.map.layers.length; i<len; i++) {
                    if (this.map.layers[i].isBaseLayer && args.b === this.map.layers[i].metadata.pl) {
                        this.map.setBaseLayer(this.map.layers[i]);
                        this.map.raiseLayer(this.map.layers[i], -1000);
                    }
                }                
            }
        },     
        CLASS_NAME: "dbkjs.ArgParser"
    });
dbkjs.Permalink = 
    OpenLayers.Class(OpenLayers.Control.Permalink, {
    argParserClass: dbkjs.ArgParser,
    SELECT_ARGUMENT_KEY: "select",
    initialize: function(options) {
        OpenLayers.Control.Permalink.prototype.initialize.apply(this, arguments);
    },
    updateLink: function() {
        var separator = this.anchor ? '#' : '?';
        var href = this.base;
        var anchor = null;
        if (href.indexOf("#") !==-1 && this.anchor === false) {
            anchor = href.substring( href.indexOf("#"), href.length);
        }
        if (href.indexOf(separator) !== -1) {
            href = href.substring( 0, href.indexOf(separator) );
        }
        var splits = href.split("#");
        href = splits[0] + separator + OpenLayers.Util.getParameterString(this.createParams());
        if (anchor) {
            href += anchor;
        }
        if (this.anchor && !this.element) {
            window.location.href = href;
        }
        else {
            this.element.href = href;
        }
    }, 
    createParams: function(center, zoom, layers) {
        center = center || this.map.getCenter();
          
        var params = OpenLayers.Util.getParameters(this.base);
        // If there's still no center, map is not initialized yet. 
        // Break out of this function, and simply return the params from the
        // base link.
        if(dbkjs.options){
            if (dbkjs.options.dbk && dbkjs.options.dbk !== 0){
                params[i18n.t('app.queryDBK')]  = dbkjs.options.dbk;
            }
        }
        if (center) { 

            //zoom
            params.zoom = zoom || this.map.getZoom(); 

            //lon,lat
            var lat = center.lat;
            var lon = center.lon;
            
            if (this.displayProjection) {
                var mapPosition = OpenLayers.Projection.transform(
                  { x: lon, y: lat }, 
                  this.map.getProjectionObject(), 
                  this.displayProjection );
                lon = mapPosition.x;  
                lat = mapPosition.y;  
            }       
            params.lat = Math.round(lat*100000)/100000;
            params.lon = Math.round(lon*100000)/100000;

            
            //layers        
            layers = this.map.layers;
            params.ly = [];
            for (var i=0, len=layers.length; i<len; i++) {
                var layer = layers[i];
                if (layer.isBaseLayer) {
                    if (layer === this.map.baseLayer){
                        params.b = layer.metadata.pl;
                    }
                } else {
                    if (layer.metadata.pl && layer.getVisibility()){
                        params.ly.push(layer.metadata.pl);
                    }
                    //params.layers += (layer.getVisibility()) ? "T" : "F";           
                }
            }
            
        }

        return params;
    }, 
    CLASS_NAME: "dbkjs.Permalink"
});

//Override drawText function on openlayers SVG.js
OpenLayers.Renderer.SVG.prototype.drawText = function(featureId, style, location) {
    var drawOutline = (!!style.labelOutlineWidth);
    // First draw text in halo color and size and overlay the
    // normal text afterwards
    if (drawOutline) {
        var outlineStyle = OpenLayers.Util.extend({}, style);
        outlineStyle.fontColor = outlineStyle.labelOutlineColor;
        outlineStyle.fontStrokeColor = outlineStyle.labelOutlineColor;
        outlineStyle.fontStrokeWidth = style.labelOutlineWidth;
        if (style.labelOutlineOpacity) {
            outlineStyle.fontOpacity = style.labelOutlineOpacity;
        }
        delete outlineStyle.labelOutlineWidth;
        this.drawText(featureId, outlineStyle, location);
    }

    var resolution = this.getResolution();

    var x = ((location.x - this.featureDx) / resolution + this.left);
    var y = (location.y / resolution - this.top);

    var suffix = (drawOutline)?this.LABEL_OUTLINE_SUFFIX:this.LABEL_ID_SUFFIX;
    var label = this.nodeFactory(featureId + suffix, "text");

    label.setAttributeNS(null, "x", x);
    label.setAttributeNS(null, "y", -y);

    if (style.fontColor) {
        label.setAttributeNS(null, "fill", style.fontColor);
    }
    if (style.fontStrokeColor) {
        label.setAttributeNS(null, "stroke", style.fontStrokeColor);
    }
    if (style.fontStrokeWidth) {
        label.setAttributeNS(null, "stroke-width", style.fontStrokeWidth);
    }
    if (style.fontOpacity) {
        label.setAttributeNS(null, "opacity", style.fontOpacity);
    }
    if (style.fontFamily) {
        label.setAttributeNS(null, "font-family", style.fontFamily);
    }
    if (style.fontSize) {
        label.setAttributeNS(null, "font-size", style.fontSize);
    }
    if (style.fontWeight) {
        label.setAttributeNS(null, "font-weight", style.fontWeight);
    }
    if (style.fontStyle) {
        label.setAttributeNS(null, "font-style", style.fontStyle);
    }
    if (style.labelSelect === true) {
        label.setAttributeNS(null, "pointer-events", "visible");
        label._featureId = featureId;
    } else {
        label.setAttributeNS(null, "pointer-events", "none");
    }
    if (style.rotation){
        label.setAttributeNS(null,"transform",
         'rotate(' + style.rotation + ',' + x + ',' + -y + ')'
        );
    }
    var align = style.labelAlign || OpenLayers.Renderer.defaultSymbolizer.labelAlign;
    label.setAttributeNS(null, "text-anchor",
        OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");

    if (OpenLayers.IS_GECKO === true) {
        label.setAttributeNS(null, "dominant-baseline",
            OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
    }

    var labelRows = style.label.split('\n');
    var numRows = labelRows.length;
    while (label.childNodes.length > numRows) {
        label.removeChild(label.lastChild);
    }
    for (var i = 0; i < numRows; i++) {
        var tspan = this.nodeFactory(featureId + suffix + "_tspan_" + i, "tspan");
        if (style.labelSelect === true) {
            tspan._featureId = featureId;
            tspan._geometry = location;
            tspan._geometryClass = location.CLASS_NAME;
        }
        if (OpenLayers.IS_GECKO === false) {
            tspan.setAttributeNS(null, "baseline-shift",
                OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
        }
        tspan.setAttribute("x", x);
        if (i === 0) {
            var vfactor = OpenLayers.Renderer.SVG.LABEL_VFACTOR[align[1]];
            // @todo: the if clause was: if(vfactor == null), this is depricatedd
            if (!vfactor) {
                 vfactor = -.5;
            }
            tspan.setAttribute("dy", (vfactor*(numRows-1)) + "em");
        } else {
            tspan.setAttribute("dy", "1em");
        }
        tspan.textContent = (labelRows[i] === '') ? ' ' : labelRows[i];
        if (!tspan.parentNode) {
            label.appendChild(tspan);
        }
    }

    if (!label.parentNode) {
        this.textRoot.appendChild(label);
    }
};
//Array.prototype.where = function(f) {
//    var lambda = function( l ) {
//        var fn = l.match(/\((.*)\)\s*=>\s*(.*)/) ;
//        var p = [] ;
//        var b = "" ;
//        if ( fn.length > 0 ) fn.shift() ;
//        if ( fn.length > 0 ) b = fn.pop() ;
//        if ( fn.length > 0 ) p = fn.pop()
//            .replace(/^\s*|\s(?=\s)|\s*$|,/g, '').split(' ') ;
//        // prepend a return if not already there.
//        fn = ( ( ! /\s*return\s+/.test( b ) ) ? "return " : "" ) + b ;   
//        p.push( fn ) ;
//        try {
//            return Function.apply( {}, p ) ;
//        } catch(e) {
//            return null ;
//        }
//    };
//
//    var fn = f;
//    // if type of parameter is string         
//    if (typeof f === "string")
//        // try to make it into a function
//        if ((fn = lambda(fn)) === null)
//            // if fail, throw exception
//            throw "Syntax error in lambda string: " + f;
//    // initialize result array
//    var res = [];
//    var l = this.length;
//    // set up parameters for filter function call
//    var p = [0, 0, res];
//    // append any pass-through parameters to parameter array               
//    for (var i = 1; i < arguments.length; i++)
//        p.push(arguments[i]);
//    // for each array element, pass to filter function
//    for (var i = 0; i < l; i++) {
//        // skip missing elements
//        if (typeof this[ i ] === "undefined")
//            continue;
//        // param1 = array element             
//        p[ 0 ] = this[ i ];
//        // param2 = current indeex
//        p[ 1 ] = i;
//        // call filter function. if return true, copy element to results            
//        if (!!fn.apply(this, p))
//            res.push(this[i]);
//    }
//    // return filtered result
//    return res;
//}

dbkjs.util = {
    layersLoading: [],
    modalPopupStore: {},
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
            dbkjs.util.alert(i18n.t('dialogs.layerNotFound'));
        }
    },
    setModalTitle: function(modal_id, title) {
        if (title instanceof $) {
            $('#' + modal_id).find('div.modal-header').first().html(title);
        } else if (typeof (title) === "string") {
            $('#' + modal_id).find('div.modal-header').first().html('<h4 class="modal-title">' + title + '</h4>');
        }

    },
    onClick: function(e) {
        //controleer of de layer onderdeel is van een module en een getfeatureinfo heeft
        $.each(dbkjs.map.layers, function(lay_index, lay) {
            if (lay.visibility && lay.dbkjsParent && lay.dbkjsParent.getfeatureinfo) {
                lay.dbkjsParent.getfeatureinfo(e);
            }
        });
    },
    isJsonNull: function(val) {
        if (val === "null" || val === null || val === "" || typeof (val) === "undefined" || val === "undefined") {
            return true;
        } else {
            return false;
        }
    },
    pad: function(num, size) {
        var s = num + "";
        while (s.length < size)
            s = "0" + s;
        return s;
    },
    parseSeconds: function(duration) {
        //duration is a momentjs object
        var x = duration.asSeconds();
        var hr = Math.floor(x / 3600);
        var min = Math.floor((x - (hr * 3600)) / 60);
        var sec = Math.floor(x - (hr * 3600) - (min * 60));
        if (min < 10) {
            min = '0' + min;
        }
        if (sec < 10) {
            sec = '0' + sec;
        }
        if (hr > 0) {
            hr += ':';
        } else {
            hr = '';
        }
        return hr + min + ':' + sec;
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
                if (typeof (feat.cluster) !== "undefined") {
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
                if (typeof (feat.cluster) !== "undefined") {
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
    },
    mediaError: function(e) {
        var msg = $($(e).parent().find('p')[0]);
        if (msg) {
            msg.html('<a href="' + e.src + '">' + e.src + '</a><br>' + i18n.t('dialogs.invalidImage'));
        }
        e.src = "images/missing.gif";
        e.onerror = "";
        return true;
    },
    createPriority: function(incidentnr, description, prio) {
        description = dbkjs.util.isJsonNull(description) ? '' : '<i>' + description + '</i>';
        incidentnr = dbkjs.util.isJsonNull(incidentnr) ? '' : '<strong>' + incidentnr + '</strong>';
        var labelclass = "label-default";
        if (prio) {
            if (prio === "Prio 1") {
                labelclass = "label-danger";
            }
            if (prio === "Prio 2") {
                labelclass = "label-warning";
            }
        }
        return $.trim(incidentnr + ' <span class="label ' + labelclass + '">' + prio + '</span>' + ' ' + description);

    },
    createNorm: function(name, real, norm) {
        name = dbkjs.util.isJsonNull(name) ? '' : '<i>' + name + '</i>';
        if (real === 0 || norm === 0) {
            return '';
        } else {
            var diff = Math.abs(real - norm);
            if (real - norm > 0) {
                sign = '+';
            } else {
                sign = '-';
            }
            if (real > norm) {
                if (real - norm > 300) {
                    labelclass = "label-danger";
                    color = "#D9534F";
                } else {
                    labelclass = "label-warning";
                    color = "#F0AD4E";
                }
            } else {
                labelclass = "label-success";
                color = "#5CB85C";
            }
            var output = '<tr><td colspan="2">Situatie: ' + name + ' - norm: ' + dbkjs.util.parseSeconds(moment.duration(norm, "seconds")) + '<td></tr>';
            output += '<tr><td colspan="2">Berekende opkomsttijd: <span class="label ' + labelclass + '">' + dbkjs.util.parseSeconds(moment.duration(real, "seconds")) + '</span><i style="color:' + color + ';"> ' + sign + dbkjs.util.parseSeconds(moment.duration(diff, "seconds")) + '</i><td></tr>';
            return output;
        }
    },
    createClassification: function(c1, c2, c3) {
        lc1 = dbkjs.util.isJsonNull(c1) ? '' : '<li><a href="#">' + c1 + '</a></li>';
        lc2 = dbkjs.util.isJsonNull(c2) ? '' : '<li><a href="#">' + c2 + '</a></li>';
        lc3 = dbkjs.util.isJsonNull(c3) ? '' : '<li><a href="#">' + c3 + '</a></li>';
        return '<ol class="breadcrumb classification">' +
                lc1 + lc2 + lc3 +
                '</ol>';
    },
    createAddress: function(city, municipality, street, housenr, housenradd, housename, zipcode) {
        city = dbkjs.util.isJsonNull(city) ? '' : city;
        municipality = dbkjs.util.isJsonNull(municipality) ? '' : municipality;
        street = dbkjs.util.isJsonNull(street) ? '' : street;
        housenr = dbkjs.util.isJsonNull(housenr) ? '' : housenr;
        housenr = housenr !== 0 ? housenr : '';
        housenradd = dbkjs.util.isJsonNull(housenradd) ? '' : housenradd;
        housename = dbkjs.util.isJsonNull(housename) ? '' : '<strong>' + housename + '</strong><br>';
        zipcode = dbkjs.util.isJsonNull(zipcode) ? '' : zipcode;
        municipality = (city === municipality) ? '' : municipality;
        var addressline1 = $.trim(street + ' ' + housenr + '  ' + housenradd);
        var addressline2 = $.trim(zipcode + '  ' + city + ' ' + municipality);
        var address_set = dbkjs.util.isJsonNull(addressline1) ? addressline2 : addressline1 + '<br>' + addressline2;
        var address = $('<address>' +
                housename +
                address_set +
                '</address>');
        return address;
    },
    createListGroup: function(item_array) {
        var listgroup = $('<ul class="list-group"></ul>');
        $.each(item_array, function(item_idx, item) {
            listgroup.append('<li class="list-group-item">' + item + '</li>');
        });
        return listgroup;
    },
    loadingStart: function(layer) {
        var arr_index = $.inArray(layer.name, this.layersLoading);
        if (arr_index === -1) {
            this.layersLoading.push(layer.name);
        }

        var alert = $('#systeem_meldingen');
        if (!alert[0]) {
            var alert = $('<div id="systeem_meldingen" class="alert alert-dismissable alert-info"></div>');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append('<i class="icon-spinner icon-spin"></i> ' + i18n.t('dialogs.busyloading') + ' ' + this.layersLoading.join(', ') + '...');
            $('body').append(alert);
            alert.show();
        } else {
            alert.removeClass('alert-success alert-info alert-warning alert-danger').addClass('alert-info');
            alert.html('');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append('<i class="icon-spinner icon-spin"></i> ' + i18n.t('dialogs.busyloading') + ' ' + this.layersLoading.join(', ') + '...');
            alert.show();
        }

    },
    loadingEnd: function(layer) {
        var alert = $('#systeem_meldingen');
        if (this.layersLoading.length !== 0) {
            var arr_index = $.inArray(layer.name, this.layersLoading);
            if (arr_index !== -1) {
                this.layersLoading.splice(arr_index, 1);
            }

            if (!alert[0]) {
                if (this.layersLoading.length === 0) {
                    if(dbkjs.argparser){
                        dbkjs.argparser.loadLayers();
                    }
                    alert.hide();
                } else {
                    var alert = $('<div id="systeem_meldingen" class="alert alert-dismissable alert-info"></div>');
                    alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
                    alert.append('<i class="icon-spinner icon-spin"></i> ' + i18n.t('dialogs.busyloading') + ' ' + this.layersLoading.join(', ') + '...');
                    $('body').append(alert);
                    alert.show();
                }
            } else {
                if (this.layersLoading.length === 0) {
                    if(dbkjs.argparser){
                        dbkjs.argparser.loadLayers();
                    }
                    alert.hide();
                } else {
                    alert.removeClass('alert-success alert-info alert-warning alert-danger').addClass('alert-info');
                    alert.html('');
                    alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
                    alert.append('<i class="icon-spinner icon-spin"></i> ' + i18n.t('dialogs.busyloading') + ' ' + this.layersLoading.join(', ') + '...');
                    alert.show();
                }
            }
        } else {
            //check the visible layers!
            if(dbkjs.argparser){
                dbkjs.argparser.loadLayers();
            }
            alert.hide();
        }
    },
    alert: function(title, tekst, type) {
        if (!type) {
            type = 'alert-info';
        }
        var content = '<strong>' + title + '</strong> ' + tekst;
        var alert = $('#systeem_meldingen');
        if (!alert[0]) {
            var alert = $('<div id="systeem_meldingen" class="alert alert-dismissable ' + type + '"></div>');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append(' ' + content);
            $('body').append(alert);
            alert.show();
        } else {
            alert.removeClass('alert-success alert-info alert-warning alert-danger').addClass(type);
            alert.html('');
            alert.append('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>');
            alert.append(' ' + content);
            alert.show();
        }
    },
    htmlEncode: function(value) {
        if (value) {
            return $('<div/>').text(value).html();
        } else {
            return '';
        }
    },
    /**
     * Verander de titel van de opgegeven panel
     * 
     * @param {string} title
     * @param {string} dialogid
     */
    changeDialogTitle: function(title, dialogid) {
        var dialog;
        if (!dialogid) {
            //asume it is the infopanel.
            dialog = $('#infopanel_h');
        } else {
            dialog = $(dialogid + '_h');
        }
        if (title) {
            $(dialog.children('span')[0]).html(title);
        }
    },
    /**
     * 
     * @param {string} id (optioneel)
     * @returns {jQuery.DOMElement} de nieuwe tabtabel
     */
    createTabbable: function(id) {
        if (!id) {
            id = OpenLayers.Util.createUniqueID("dbkjs_tabbable_");
        }
        var tabbable = $('<div id="' + id + '" class="tabbable"></div>');
        var ul = $('<ul class="nav nav-tabs"></ul>');
        var tab = $('<div class="tab-content"></div>');
        // @todo voor nu alleen tabs boven. Wellicht in de toekomst wat flexibeler maken
        tabbable.append(ul);
        tabbable.append(tab);
        return tabbable;
    },
    /**
     * Retourneert de tab_content id placeholder zodat hierop 
     * kan worden ingevoerd, kan eventueel met een bestaande id worden
     * aangeroepen.
     * 
     * @param {string} parent_id
     * @param {string} tab_title
     * @param {string} tab_content
     * @param {boolean} active tab aan of uit.
     * @param {string} id (optional)
     * @returns {string}
     */
    appendTab: function(parent_id, tab_title, tab_content, active, id) {
        var parent_ul = $('#' + parent_id + ' ul').first();
        var parent_tab = $('#' + parent_id + ' .tab-content').first();

        var li;
        var ref;
        var pane;
        if (!id) {
            var id = OpenLayers.Util.createUniqueID("dbkjs.tab_pane_");
        }

        li = $('#' + id + '_tab');
        pane = $('#' + id);
        if (li.length === 0) {
            li = $('<li id="' + id + '_tab"></li>');
            ref = $('<a href="#' + id + '" data-toggle="tab"></a>');
            li.append(ref);
            parent_ul.append(li);
        }
        ref = li.children().first();
        if (pane.length === 0) {
            pane = $('<div class="tab-pane active" id="' + id + '"></div>');
            parent_tab.append(pane);
        }
        ref.html(tab_title);
        pane.html(tab_content);
        if (active) {
            //verwijder van alle andere tabs de active state!
            parent_ul.children().removeClass('active');
            parent_tab.children().removeClass('active');
            li.addClass('active');
            pane.addClass('active');
        }
        return id;
    },
    removeTab: function(parent_id, id) {
        $('#' + id + '_tab').remove();
        $('#' + id).remove();
        $('#' + parent_id + ' ul').first().children().first().addClass('active');
        $('#' + parent_id + ' .tab-content').first().children().first().addClass('active');
    },
    createDialog: function(id, title, styleoptions) {
        if (!styleoptions) {
            styleoptions = '';
        }
        var dialog = $('<div class="panel dialog" id="' + id + '" style="display:none;' + styleoptions + '"></div>');
        var heading = $('<div id="' + id + '_h" class="panel-heading"></div>');
        var close_button = $('<button type="button" class="close" aria-hidden="true">&times;</button>');
        heading.append(close_button);
        heading.append('<span class="h4">' + title + '</span>');
        var dg_body = $('<div id="' + id + '_b" class="panel-body"></div>');
        var dg_footer = $('<div id="' + id + '_f" class="panel-footer"></div>');
        dialog.append(heading);
        dialog.append(dg_body);
        dialog.append(dg_footer);
        close_button.click(function() {
            dialog.hide();
        });
        return dialog;
    },
    createModal: function(id, title, styleoptions) {
        var modal_wrapper = $('<div class="modal fade" id="' + id + '"></div>');
        var modal_dialog = $('<div class="modal-dialog"></div>');
        var modal_content = $('<div class="modal-content"></div>');
        var modal_header = $('<div id="' + id + '_h" class="modal-header"><h4 class="modal-title">' + title + '</h4></div>');
        var modal_body = $('<div id="' + id + '_b" class="modal-body"></div>');
        modal_content.append(modal_header);
        modal_content.append(modal_body);
        modal_wrapper.append(modal_dialog.append(modal_content));
        modal_wrapper.modal('hide');
        return modal_wrapper;
    },
    exportTableToCSV: function($table, filename) {
        var $rows = $table.find('tr:has(td)'),
                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                tmpColDelim = String.fromCharCode(11), // vertical tab character
                tmpRowDelim = String.fromCharCode(0), // null character

                // actual delimiter characters for CSV format
                colDelim = '","',
                rowDelim = '"\r\n"',
                // Grab text from table into CSV formatted string
                csv = '"' + $rows.map(function(i, row) {
                    var $row = $(row),
                            $cols = $row.find('td');
                    return $cols.map(function(j, col) {
                        var $col = $(col),
                                text = $col.text();
                        return text.replace('"', '""'); // escape double quotes

                    }).get().join(tmpColDelim);
                }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',
                // Data URI
                csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
        $(this)
                .attr({
                    'download': filename,
                    'href': csvData,
                    'target': '_blank'
                });
    },
    padspaces: function(num, field) {
        var n = '' + num;
        var w = n.length;
        var l = field.length;
        var pad = w < l ? l - w : 0;
        return n + field.substr(0, pad);
    },
    strip: function(html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return $(tmp).text().replace(urlRegex, function(url) {
            return '\n' + url;
        });
    },
    renderHTML: function(text) {
        var rawText = this.strip(text);
        var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return rawText.replace(urlRegex, function(url) {
            if ((url.indexOf(".jpg") > 0) || (url.indexOf(".png") > 0) || (url.indexOf(".gif") > 0)) {
                return '<img src="' + url + '">' + '<br/>';
            } else {
                return '<a href="' + url + '" target="_blank">' + url + '</a>' + '<br/>';
            }
        });
    },
    bearing: function(pt1,pt2){
        var bx = 0;
        var by = 1;
        var ax = pt2.x - pt1.x;
        var ay = pt2.y - pt1.y;
        var angle_rad = Math.acos((ax*bx+ay*by)/Math.sqrt(ax*ax+ay*ay));
        var angle = 360/(2*Math.PI)*angle_rad;
        if (ax < 0){
            return 360 - angle;
        } else { 
            return angle;
        }
    },
    createModalPopup: function(options) {
        // Init default options
        if(options === undefined) {
            options = {};
        }
        if(!options.name) {
            options.name = 'modal' + (this.modalPopupStore.length + 1);
        }
        // Create the popup
        var popup = $('<div></div>')
            .attr({
                'class': 'modal-popup'
            })
            .appendTo('body');
        $('<a></a>')
            .attr({
                'class': 'modal-popup-close',
                'href': '#'
            })
            .html('<i class="icon-angle-left"></i> Terug')
            .on('click', function(e) {
                e.preventDefault();
                hidingFunction();
            })
            .appendTo(popup);
        $('<div></div>')
            .addClass('modal-popup-title')
            .html(options.title || '')
            .appendTo(popup);
        var view = $('<div></div>')
            .addClass('modal-popup-view')
            .appendTo(popup);

        var hideCallback = function() {};
        if(options.hideCallback) {
            hideCallback = options.hideCallback;
        }

        var hidingFunction = function() {
            popup.removeClass('modal-popup-active');
            if(hideCallback) {
                hideCallback();
            }
        }

        // Return object to handle popup related functions
        this.modalPopupStore[options.name] = {
            getView: function() {
                return view;
            },
            show: function() {
                // request css property to force layout computation, making animation possible
                // see http://stackoverflow.com/questions/7069167/css-transition-not-firing
                popup.css('width');
                popup.addClass('modal-popup-active');
            },
            hide: function() {
                hidingFunction();
            },
            setHideCallback: function(fn) {
                hideCallback = fn;
            }
        };

        return this.modalPopupStore[options.name];
    },
    getModalPopup: function(name) {
        if(!this.modalPopupStore.hasOwnProperty(name)) {
            // Return 'fake' popup object so no errors arise
            return {
                getView: function() { return $([]); },
                show: function() {},
                hide: function() {},
                setHideCallback: function() {}
            };
        }
        return this.modalPopupStore[name];
    }
};