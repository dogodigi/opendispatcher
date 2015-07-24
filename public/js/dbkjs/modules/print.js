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

dbkjs.modules.print = {
    id: 'dbk.modules.print',
    register: function(options) {
        var _obj = dbkjs.modules.print;
        _obj.printDialog('#printpanel_b');
        _obj.namespace = options.namespace || _obj.namespace;
        _obj.url = options.url || _obj.url;
        _obj.visibility = options.visible || _obj.visibility;
        $('#btngrp_3').append(
            '<a id="btn_print" class="btn btn-default navbar-btn" href="#" title="' + 
            i18n.t('app.print') + 
            '"><i class="fa fa-print"></i></a>'
        );

        $('#btn_print').click(function() {
            //$('#printpanel').modal();
            //_obj.printdirect(dbkjs.map, 2, options);
            _obj.doPrint();
        });
    },
    doPrint: function(){
        if (!dbkjs.util.isJsonNull(dbkjs.options.dbk) && dbkjs.options.dbk !== 0) {
                var currentFeature = dbkjs.options.feature;
                var testObject = {
                    "options": {
                        "units": "m",
                        "srs": "EPSG:28992",
                        "layout": "A3 Landscape",
                        "dpi": 150,
                        "mapTitle": dbkjs.options.organisation.title,
                        "titlepage": true
                    },
                    "pages": [{}]
                };
                //add the features porperties
                $.extend(testObject.options, currentFeature);
                testObject.options.informatie = {};
                testObject.options.informatie.columns = ["soort", "tekst"];
                testObject.options.informatie.data = [];
                //remove unwanted stuff if available
                if(currentFeature.adres){
                    if (currentFeature.adres.length > 0) {
                        var adr_str = '';
                        $.each(currentFeature.adres, function(adr_index, adr) {
                            adr_str += adr.openbareRuimteNaam + ' ' + adr.huisnummer + 
                                adr.huisnummertoevoeging + adr.huisletter + '\n' + 
                                adr.postcode + ' ' + adr.woonplaatsNaam + ' ' + adr.gemeenteNaam +
                                '\n\n';
                        });
                        testObject.options.adres = adr_str;
                    }
                }
                $.each(testObject.options, function(op_idx, op_val){
                    if (dbkjs.util.isJsonNull(op_val)){
                        delete testObject.options[op_idx];
                    }
                });
                if (currentFeature.bijzonderheid){
                    testObject.options.bijzonderheid = {};
                    testObject.options.bijzonderheid.columns = ["soort", "tekst"];
                    testObject.options.bijzonderheid.data = [];
                    var adr_str = '';
                        var set = {
                            "Algemeen":'',
                            "Preparatie":'', 
                            "Preventie":'', 
                            "Repressie": ''
                        };
                        $.each(currentFeature.bijzonderheid, function(adr_index, adr) {
                            set[adr.soort] += ''  + adr.tekst + '\n';
                            //adr_str += adr.soort + ': ' + adr.tekst + '\n\n';
                        });
                        if(set.Algemeen !== ''){
                            testObject.options.bijzonderheid.data.push({"soort": "Algemeen", "tekst": set.Algemeen});
                        }
                        if(set.Preparatie !== ''){
                            testObject.options.bijzonderheid.data.push({"soort": "Preparatie", "tekst": set.Preparatie});
                        }
                        if(set.Preventie !== ''){
                            testObject.options.bijzonderheid.data.push({"soort": "Preventie", "tekst": set.Preventie});
                        }
                        if(set.Repressie !== ''){
                            testObject.options.bijzonderheid.data.push({"soort": "Repressie", "tekst": set.Repressie});
                        }
                }
                if (currentFeature.brandcompartiment){
                    delete testObject.options.brandcompartiment;
                    $.each(currentFeature.brandcompartiment, function(adr_index, adr) {
                        if(!dbkjs.util.isJsonNull(adr.aanvullendeInformatie)){
                            testObject.options.informatie.data.push({"soort": "Compartiment", "tekst": adr.typeScheiding + ": " +adr.aanvullendeInformatie});
                        }
                    });
                }
                if (currentFeature.brandweervoorziening){
                    delete testObject.options.brandweervoorziening;
                    $.each(currentFeature.brandweervoorziening, function(adr_index, adr) {
                        if(!dbkjs.util.isJsonNull(adr.aanvullendeInformatie)){
                            testObject.options.informatie.data.push({"soort": "Voorziening", "tekst": adr.naamVoorziening + ": " + adr.aanvullendeInformatie});
                        }
                    });
                }

                if(currentFeature.contact){
                    if (currentFeature.contact.length > 0) {
                        var adr_str = '';
                        $.each(currentFeature.contact, function(adr_index, adr) {
                            adr_str += adr.naam + '\n' + 
                                adr.telefoonnummer + '\n' + 
                                '('  + adr.functie + ')\n\n';
                        });
                        testObject.options.contact = adr_str;
                    }
                }
                if (currentFeature.foto){
                    delete testObject.options.foto;
                }
                if (currentFeature.hulplijn){
                    delete testObject.options.hulplijn;
                }
                if (currentFeature.pandgeometrie){
                    delete testObject.options.pandgeometrie;
                }
                if (currentFeature.tekstobject){
                    delete testObject.options.tekstobject;
                }
                if (currentFeature.toegangterrein){
                    delete testObject.options.toegangterrein;
                }
                if (currentFeature.verdiepingen){
                    delete testObject.options.verdiepingen;
                }
                
                if(currentFeature.verblijf){
                    if (currentFeature.verblijf.length > 0) {
                        testObject.options.verblijf = {};
                        testObject.options.verblijf.columns = ["groep", "aantal", "begin", "eind", "nietzelfredzaam"];
                        testObject.options.verblijf.data = [];
                        $.each(currentFeature.verblijf, function(adr_index, adr) {
                            testObject.options.verblijf.data.push(adr);
                        });
                    }
                }
                
                if (currentFeature.images) {
                    delete testObject.options.images;
                    if (currentFeature.images.length > 0) {
                        $.each(currentFeature.images, function(img_index, img) {
                            testObject.options["image" + (img_index + 1)] = encodeURI(img);
                        });
                    }
                }
                if (currentFeature.gevaarlijkestof) {
                    if (currentFeature.gevaarlijkestof.length > 0) {
                        testObject.options.gevaarlijkestof = {};
                        testObject.options.gevaarlijkestof.columns = ["icon", "gevaarsindicatienummer", "UNnummer", "naamStof", "hoeveelheid", "aanvullendeInformatie", "symboolCode"];
                        testObject.options.gevaarlijkestof.data = [];
                        $.each(currentFeature.gevaarlijkestof, function(adr_index, adr) {
                            adr.icon = dbkjs.basePath + 'images/eughs/' + adr.symboolCode + '.png';
                            testObject.options.gevaarlijkestof.data.push(adr);
                        });
                    }
                }
                if(testObject.options.informatie.data.length === 0){
                    delete testObject.options.informatie;
                }
                
                var center = dbkjs.map.getCenter();
                testObject.pages[0].center = [center.lon, center.lat];
                testObject.pages[0].scale = Math.ceil(dbkjs.map.getScale());
                testObject.pages[0].rotation = 0;
                dbkjs.modules.print.printdirect(dbkjs.map, 
                    testObject.pages, 
                    testObject.options);
            } else {
                var testObject = {
                    "options": {
                        "units": "m",
                        "srs": "EPSG:28992",
                        "layout": "A3 Landscape",
                        "dpi": 150,
                        "mapTitle": dbkjs.options.organisation.title
                    },
                    "pages": [{}]
                };
                var center = dbkjs.map.getCenter();
                testObject.pages[0].center = [center.lon, center.lat];
                testObject.pages[0].scale = Math.ceil(dbkjs.map.getScale());
                testObject.pages[0].rotation = 0;
                dbkjs.modules.print.printdirect(dbkjs.map, testObject.pages, testObject.options);                
            }
    },
    capabilities: null,
    method: "POST",
    customParams: null,
    scales: null,
    dpis: null,
    layouts: null,
    dpi: null,
    layout: null,
    encoding: document.charset || document.characterSet || "UTF-8",
    timeout: 30000,
    setLayout: function(layout) {
        this.layout = layout;
    },
    setDpi: function(dpi) {
        this.dpi = dpi;
    },
    printdirect: function(map, pages, options) {
        dbkjs.modules.print.loadCapabilities(function(capabilities) {
            dbkjs.modules.print.setLayout({
                name: options.layout,
                rotation: true,
                map: {
                    height: 776,
                    width: 1130
                }
            });
            dbkjs.modules.print.setDpi(options.dpi);
            dbkjs.modules.print.print(map, pages, options);
        });
    },
    print: function(map, pages, options) {
        var _obj = dbkjs.modules.print;
        pages = pages instanceof Array ? pages : [pages];
        options = options || {};
        var jsonData = $.extend(_obj.customParams, options);
        jsonData = $.extend(jsonData, {
            units: map.getUnits(),
            srs: map.baseLayer.projection.getCode(),
            layout: _obj.layout.name,
            dpi: _obj.dpi.value
        });

        // feature wordt gebruikt voor de extent van de kaart.. Ik moet nog even uitvinden hoe..
        //var pagesLayer = pages[0].feature.layer;
        var encodedLayers = [];

        // ensure that the baseLayer is the first one in the encoded list
        var layers = map.layers.concat(); //concat results in a new array
        //layers.remove(map.baseLayer);
        var a = layers.indexOf(map.baseLayer);
        layers.splice(a,1);
        layers.unshift(map.baseLayer);
        $.each(layers, function(layer_idx, layer) {
            if (layer.name !== null && "Feature,feature_sketch,BAG".indexOf(layer.name) === -1) {
                if (
                        //layer !== pagesLayer && 
                        layer.getVisibility() === true) {
                    var enc = _obj.encodeLayer(layer);
                    enc && encodedLayers.push(enc);
                }
            }
        });
        jsonData.layers = encodedLayers;

        var encodedPages = [];
        $.each(pages, function(page_idx, page) {
            encodedPages.push(
                    $.extend(page.customParams, {
                center: [page.center[0], page.center[1]],
                scale: page.scale,
                rotation: page.rotation
            })
                    );
        });
        jsonData.pages = encodedPages;
        var encodedOverviewLayers = [];
        if (options.overview) {
            $.each(options.overview.layers, function(layer) {
                var enc = _obj.encodeLayer(layer);
                enc && encodedOverviewLayers.push(enc);
            });
            jsonData.overviewLayers = encodedOverviewLayers;
        } else {
            //set the baseLayers as the overviewlayer
            var enc = _obj.encodeLayer(map.baseLayer);
            encodedOverviewLayers.push(enc);
            jsonData.overviewLayers = encodedOverviewLayers;
        }
        $.ajax({
            type: _obj.method,
            url: "/print/pdf/" + "create.json",
            contentType: "application/json; charset=UTF-8",
            data: JSON.stringify(jsonData),
            dataType: "json",
            success: function(response) {
                _obj.download(response.getURL);
            },
            error: function(response) {
                alert(response.responseText);
            }
        });
    },
    printDialog: function(parent) {
        var form = $('<form id="print-form" role="form"></form>');
        //form.append('<p class="bg-info">' + "Kies de juiste instellingen" + '</p>');
        var layoutgroup = $('<div class="form-group"></div>');
        layoutgroup.append('<label for="layout">' + "Layout" + '</label>');
        layoutgroup.append('<select name="layout"><option>Kies een layout</option></select>');
        form.append(layoutgroup);
        $(parent).append(form);
    },
    download: function(url) {
        var _obj = dbkjs.modules.print;
        // Er zit een bug in de manier waarop de PDF wordt aangeboden. Deze houdt geen rekening met proxies die serverside zijn ingesteld
        // De oplossing is om de bestandsnaam uit de URL te halen en de juiste relatieve URL er van te maken.
        //var url = _obj.url + "pdf/" + "info.json";
        var url_arr = url.split('/');
        var filename = url_arr[url_arr.length - 1];

        window.open("/print/pdf/" + filename);
    },
    loadCapabilities: function(callback) {
        var _obj = dbkjs.modules.print;
        if (!_obj.url) {
            return;
        }
        var url = "/print/pdf/" + "info.json";
        $.ajax({
            url: url,
            type: "GET",
            data: "",
            success: function(response) {
                _obj.capabilities = response;
                if (callback) {
                    callback.call();
                }
            },
            error: function(response) {
                alert(response.responseText);
            }
        });

    },
    /**
     * 
     * @param {type} layer
     * @returns {dbkjs.modules.print.encodeLayer.encLayer|@exp;encLayer@pro;type}
     */
    encodeLayer: function(layer) {
        var _obj = dbkjs.modules.print;
        var encLayer;
        for (var c in _obj.encoders.layers) {
            if (OpenLayers.Layer[c] && layer instanceof OpenLayers.Layer[c]) {
                encLayer = _obj.encoders.layers[c].call(_obj, layer);
                break;
            }
        }
        // only return the encLayer object when we have a type. Prevents a
        // fallback on base encoders like HTTPRequest.
        return (encLayer && encLayer.type) ? encLayer : null;
    },
    encoders: {
        "layers": {
            "Layer": function(layer) {
                var enc = {};
                if (layer.options && layer.options.maxScale) {
                    enc.minScaleDenominator = layer.options.maxScale;
                }
                if (layer.options && layer.options.minScale) {
                    enc.maxScaleDenominator = layer.options.minScale;
                }
                return enc;
            },
            "WMS": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                enc.singleTile = layer.singleTile;
                $.extend(enc, {
                    type: 'WMS',
                    layers: [layer.params.LAYERS].join(",").split(","),
                    format: layer.params.FORMAT,
                    styles: [layer.params.STYLES].join(",").split(","),
                    singleTile: layer.singleTile
                });
                var param;
                for (var p in layer.params) {
                    param = p.toLowerCase();
                    if (layer.params[p] !== null && !layer.DEFAULT_PARAMS[param] &&
                            "layers,styles,width,height,srs".indexOf(param) === -1) {
                        if (!enc.customParams) {
                            enc.customParams = {};
                        }
                        enc.customParams[p] = layer.params[p];
                    }
                }
                return enc;
            },
            "OSM": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.TileCache.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    type: 'OSM',
                    baseURL: enc.baseURL.substr(0, enc.baseURL.indexOf("$")),
                    extension: "png"
                });
            },
            "TMS": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.TileCache.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    type: 'TMS',
                    format: layer.type,
                    "tileOrigin": {"x": -285401.920, "y": 22598.080}
                });
            },
            "TileCache": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    type: 'TileCache',
                    layer: layer.layername,
                    maxExtent: layer.maxExtent.toArray(),
                    tileSize: [layer.tileSize.w, layer.tileSize.h],
                    extension: "png",
                    resolutions: layer.serverResolutions || layer.resolutions
                });
            },
            "WMTS": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                enc = $.extend(enc, {
                    type: 'WMTS',
                    layer: layer.layer,
                    version: layer.version,
                    requestEncoding: layer.requestEncoding,
                    style: layer.style,
                    dimensions: layer.dimensions,
                    params: layer.params,
                    matrixSet: layer.matrixSet
                });
                if (layer.matrixIds) {
                    if (layer.requestEncoding === "KVP") {
                        enc.format = layer.format;
                    }
                    enc.matrixIds = [];
                    $.each(layer.matrixIds, function(matrixId_idx, matrixId) {
                        enc.matrixIds.push({
                            identifier: matrixId.identifier,
                            matrixSize: [matrixId.matrixWidth, matrixId.matrixHeight],
                            resolution: matrixId.scaleDenominator * 0.28E-3 / OpenLayers.METERS_PER_INCH / OpenLayers.INCHES_PER_UNIT[layer.units],
                            tileSize: [matrixId.tileWidth, matrixId.tileHeight],
                            topLeftCorner: [matrixId.topLeftCorner.lon, matrixId.topLeftCorner.lat]
                        });
                    });
                    return enc;
                }
                else {
                    return $.extend(enc, {
                        formatSuffix: layer.formatSuffix,
                        tileOrigin: [layer.tileOrigin.lon, layer.tileOrigin.lat],
                        tileSize: [layer.tileSize.w, layer.tileSize.h],
                        maxExtent: (layer.tileFullExtent !== null) ? layer.tileFullExtent.toArray() : layer.maxExtent.toArray(),
                        zoomOffset: layer.zoomOffset,
                        resolutions: layer.serverResolutions || layer.resolutions
                    });
                }
            },
            "KaMapCache": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.KaMap.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    type: 'KaMapCache',
                    // group param is mandatory when using KaMapCache
                    group: layer.params['g'],
                    metaTileWidth: layer.params['metaTileSize']['w'],
                    metaTileHeight: layer.params['metaTileSize']['h']
                });
            },
            "KaMap": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.HTTPRequest.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    type: 'KaMap',
                    map: layer.params['map'],
                    extension: layer.params['i'],
                    // group param is optional when using KaMap
                    group: layer.params['g'] || "",
                    maxExtent: layer.maxExtent.toArray(),
                    tileSize: [layer.tileSize.w, layer.tileSize.h],
                    resolutions: layer.serverResolutions || layer.resolutions
                });
            },
            "HTTPRequest": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.Layer.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    baseURL: dbkjs.modules.print.getAbsoluteUrl(layer.url instanceof Array ?
                            layer.url[0] : layer.url),
                    opacity: (layer.opacity !== null) ? layer.opacity : 1.0
                });
            },
            "Image": function(layer) {
                var enc = dbkjs.modules.print.encoders.layers.Layer.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    type: 'Image',
                    baseURL: dbkjs.modules.print.getAbsoluteUrl(layer.getURL(layer.extent)),
                    opacity: (layer.opacity !== null) ? layer.opacity : 1.0,
                    extent: layer.extent.toArray(),
                    pixelSize: [layer.size.w, layer.size.h],
                    name: layer.name
                });
            },
            "Vector": function(layer) {
                if (!layer.features.length) {
                    return;
                }

                var encFeatures = [];
                var encStyles = {};
                var features = layer.features;
                var featureFormat = new OpenLayers.Format.GeoJSON();
                var styleFormat = new OpenLayers.Format.JSON();
                var nextId = 0;
                var styleDict = {};
                var feature, style, dictKey, dictItem, styleName;
                for (var i = 0, len = features.length; i < len; ++i) {
                    feature = features[i];
                    style = feature.style || layer.style ||
                            layer.styleMap.createSymbolizer(feature,
                            feature.renderIntent);

                    // don't send unvisible features
                    if (style.display === 'none') {
                        continue;
                    }

                    dictKey = styleFormat.write(style);
                    dictItem = styleDict[dictKey];
                    if (dictItem) {
                        //this style is already known
                        styleName = dictItem;
                    } else {
                        //new style
                        styleDict[dictKey] = styleName = nextId++;
                        if (style.externalGraphic) {
                            encStyles[styleName] = $.extend(style, {
                                externalGraphic: dbkjs.modules.print.getAbsoluteUrl(style.externalGraphic)
                            });
                        } else {
                            encStyles[styleName] = style;
                        }
                    }
                    feature.attributes['_style'] = styleName;
                    var featureGeoJson = featureFormat.extract.feature.call(
                            featureFormat, feature);
                    encFeatures.push(featureGeoJson);
                }
                var enc = dbkjs.modules.print.encoders.layers.Layer.call(dbkjs.modules.print, layer);
                return $.extend(enc, {
                    type: 'Vector',
                    styles: encStyles,
                    geoJson: {
                        type: "FeatureCollection",
                        features: encFeatures
                    },
                    name: layer.name,
                    opacity: (layer.opacity !== null) ? layer.opacity : 1.0
                });
            },
            "Markers": function(layer) {
                var features = [];
                for (var i = 0, len = layer.markers.length; i < len; i++) {
                    var marker = layer.markers[i];
                    var geometry = new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat);
                    var style = {externalGraphic: marker.icon.url,
                        graphicWidth: marker.icon.size.w, graphicHeight: marker.icon.size.h,
                        graphicXOffset: marker.icon.offset.x, graphicYOffset: marker.icon.offset.y};
                    var feature = new OpenLayers.Feature.Vector(geometry, {}, style);
                    features.push(feature);
                }
                var vector = new OpenLayers.Layer.Vector(layer.name);
                vector.addFeatures(features);
                var output = dbkjs.modules.print.encoders.layers.Vector.call(dbkjs.modules.print, vector);
                vector.destroy();
                return output;
            }
        }
    },
    getAbsoluteUrl: function(url) {
        if ($.browser.safari) {
            url = url.replace(/{/g, '%7B');
            url = url.replace(/}/g, '%7D');
        }
        var a;
        if ($.browser.msie) {
            a = document.createElement("a");
            a.href = url;
            a.style.display = "none";
            document.body.appendChild(a);
            document.body.removeChild(a);
        } else {
            a = document.createElement("a");
            a.href = url;
        }
        return a.href;
    }
};
